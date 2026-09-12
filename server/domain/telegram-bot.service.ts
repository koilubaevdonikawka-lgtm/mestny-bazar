import type { ITelegramBotRepository } from "@server/ports/telegram-bot.repository";
import type { ITelegramBotApi } from "@server/ports/telegram-bot-api.port";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import type { IAiTextProvider } from "@server/ports/ai-provider.port";
import type { MediaUploadService } from "@server/domain/media-upload.service";
import type { SellerProductService } from "@server/domain/seller-product.service";
import type {
  TelegramMessage,
  TelegramUpdate,
} from "@server/adapters/telegram/telegram-update.types";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";
import { MediaUploadContext } from "@shared/contracts/media-upload";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";
import { logger } from "@shared/observability/logger";

const NO_ACCESS_MESSAGE = "У вас нет доступа";
const NO_CATEGORY_MESSAGE = "Сначала укажите категорию/подкатегорию.";
const UNSUPPORTED_MESSAGE_TYPE_MESSAGE =
  "Я понимаю только текст с названием раздела (категории/подкатегории), фото товара (или альбом из нескольких фото — это будет один товар) и команду изменения цены (Номер: X / Цена: Y). К фото можно (не обязательно) приложить подпись: первая строка — название, дальше — описание, затем любые строки вида «Цена: 200», «Страна: Россия», «Номер: 45».";
const GENERIC_ERROR_MESSAGE =
  "Что-то пошло не так при обработке. Попробуйте ещё раз, или напишите админу платформы.";
const MAX_CATEGORY_SUGGESTIONS = 5;
/**
 * Задача №266 — how long the album's "claiming" delivery waits for sibling
 * photos (separate webhook deliveries for the same media_group_id) to land
 * before gathering. Telegram typically delivers every member of an album
 * within a few hundred ms of each other; this is a deliberately generous
 * multiple of that, not a measured worst-case guarantee.
 */
const ALBUM_GATHER_DELAY_MS = 1500;

/**
 * Задача №264 — instructs Gemini to act purely as OCR, never to invent a
 * name it can't actually read off the package. The literal "NONE" sentinel
 * (checked case-insensitively in google-ai.adapter.ts) is how the model
 * signals "nothing legible," distinct from returning an empty string.
 */
const OCR_INSTRUCTION = [
  "Look at this product package photo and read the exact product name text",
  "printed on it — nothing more.",
  "Return ONLY that name, exactly as printed, with no translation, no",
  "explanation, no quotes, no extra formatting.",
  "If there is no clearly legible product name printed anywhere in the photo, reply with exactly: NONE",
].join(" ");

export interface ParsedCaption {
  name: string;
  description: string | null;
  /** Null = not specified in the caption — caller defaults to 1. */
  price: number | null;
  /** Null = not specified. */
  countryOfOrigin: string | null;
  /** Decimal string, exactly as typed (see SellerProductDTO.sortOrder) — null = not specified, caller omits it so createProduct() auto-assigns via next_product_sort_order(), same as the regular admin form. */
  sortOrder: string | null;
}

const CAPTION_LABEL_PATTERN = /^(Цена|Страна|Номер):\s*(.*)$/;

/**
 * Задача №266 — replaces the old "line 1 = name, everything else =
 * description" parser. Line 1 is still always the name, unconditionally.
 * Line 2 onward is description text UP TO the first recognized label line;
 * from that point on, every line is treated as label territory — a
 * subsequent line that isn't itself "Цена:"/"Страна:"/"Номер:" is silently
 * ignored there (not appended back into description), matching the accepted
 * spec ("любое количество строк вида 'Метка: значение', в любом порядке").
 */
export function parseCaption(caption: string): ParsedCaption {
  const lines = caption.split("\n");
  const name = lines[0]?.trim() ?? "";

  const descriptionLines: string[] = [];
  let price: number | null = null;
  let countryOfOrigin: string | null = null;
  let sortOrder: string | null = null;
  let inLabelSection = false;

  for (const line of lines.slice(1)) {
    const match = line.match(CAPTION_LABEL_PATTERN);
    if (match) {
      inLabelSection = true;
      const [, label, rawValue] = match;
      const value = rawValue.trim();
      if (label === "Цена" && value) {
        const parsedPrice = Number(value.replace(",", "."));
        if (Number.isFinite(parsedPrice)) price = parsedPrice;
      } else if (label === "Страна" && value) {
        countryOfOrigin = value;
      } else if (label === "Номер" && value) {
        sortOrder = value;
      }
      continue;
    }
    if (!inLabelSection) descriptionLines.push(line);
  }

  const description = descriptionLines.join("\n").trim() || null;
  return { name, description, price, countryOfOrigin, sortOrder };
}

export function fallbackProductName(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return `Без названия ${stamp}`;
}

/** Задача №265 — price-change command prefix, checked before any category matching. */
const PRICE_COMMAND_PREFIX = "Номер:";
const PRICE_COMMAND_FORMAT_MESSAGE =
  "Чтобы изменить цену товара, отправьте сообщение в формате:\nНомер: <порядковый номер товара>\nЦена: <новая цена>";

export function isPriceCommand(text: string): boolean {
  return text.trim().startsWith(PRICE_COMMAND_PREFIX);
}

export interface ParsedPriceCommand {
  /** Decimal string, exactly as typed — never parsed into a JS number (see SellerProductDTO.sortOrder). */
  sortOrder: string | null;
  price: number | null;
}

export function parsePriceCommand(text: string): ParsedPriceCommand {
  const numberMatch = text.match(/Номер:\s*(\S+)/);
  const priceMatch = text.match(/Цена:\s*(\S+)/);
  const sortOrder = numberMatch ? numberMatch[1].trim() : null;
  const priceRaw = priceMatch ? priceMatch[1].trim().replace(",", ".") : null;
  const parsedPrice = priceRaw !== null ? Number(priceRaw) : null;
  const price = parsedPrice !== null && Number.isFinite(parsedPrice) ? parsedPrice : null;
  return { sortOrder, price };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** Category "path" as shown to the admin — "Родитель → Подкатегория" for a subcategory, just the name for a top-level one. */
export function categoryDisplayName(category: AdminCategoryDTO, all: AdminCategoryDTO[]): string {
  if (!category.parentId) return category.name;
  const parent = all.find((c) => c.id === category.parentId);
  return parent ? `${parent.name} → ${category.name}` : category.name;
}

export type CategoryMatch =
  | { type: "found"; category: AdminCategoryDTO }
  | { type: "ambiguous"; suggestions: string[] }
  | { type: "not_found" };

/**
 * Exact name/nameKg match wins outright; otherwise a bidirectional substring
 * check (either the input contains the category's name or vice versa) catches
 * a close-enough typed name ("Молочка" -> "Молочные продукты") without
 * pulling in a real fuzzy-matching dependency for what's meant to stay a
 * small, single-admin convenience today.
 */
export function matchCategory(input: string, categories: AdminCategoryDTO[]): CategoryMatch {
  const norm = normalize(input);
  if (!norm) return { type: "not_found" };

  const exact = categories.filter(
    (c) => normalize(c.name) === norm || (c.nameKg != null && normalize(c.nameKg) === norm),
  );
  if (exact.length === 1) return { type: "found", category: exact[0] };
  if (exact.length > 1) {
    return { type: "ambiguous", suggestions: exact.map((c) => categoryDisplayName(c, categories)) };
  }

  const partial = categories.filter((c) => {
    const name = normalize(c.name);
    const nameKg = c.nameKg != null ? normalize(c.nameKg) : null;
    return (
      name.includes(norm) ||
      norm.includes(name) ||
      (nameKg != null && (nameKg.includes(norm) || norm.includes(nameKg)))
    );
  });
  if (partial.length === 1) return { type: "found", category: partial[0] };
  if (partial.length > 1) {
    return {
      type: "ambiguous",
      suggestions: partial
        .slice(0, MAX_CATEGORY_SUGGESTIONS)
        .map((c) => categoryDisplayName(c, categories)),
    };
  }
  return { type: "not_found" };
}

export class TelegramBotService {
  constructor(
    private readonly repo: ITelegramBotRepository,
    private readonly telegramApi: ITelegramBotApi,
    private readonly categories: IAdminCategoryRepository,
    private readonly aiText: IAiTextProvider,
    private readonly mediaUploadService: MediaUploadService,
    private readonly sellerProductService: SellerProductService,
  ) {}

  async handleUpdate(update: TelegramUpdate): Promise<void> {
    const isNewUpdate = await this.repo.markUpdateProcessed(update.update_id);
    if (!isNewUpdate) {
      logger.info("telegram-bot:duplicate-update-skipped", { updateId: update.update_id });
      return;
    }

    const message = update.message;
    if (!message?.from) {
      // Not a plain user message this bot handles (e.g. edited_message,
      // channel_post, callback_query) — nothing to reply to.
      return;
    }

    const chatId = message.chat.id;
    const admin = await this.repo.findAdmin(message.from.id);
    if (!admin) {
      await this.safeSend(chatId, NO_ACCESS_MESSAGE);
      return;
    }

    try {
      if (message.photo && message.photo.length > 0) {
        await this.handlePhotoMessage(chatId, message);
      } else if (message.text?.trim() && isPriceCommand(message.text)) {
        await this.handlePriceCommand(chatId, message.text);
      } else if (message.text?.trim()) {
        await this.handleTextMessage(chatId, message.text);
      } else {
        await this.telegramApi.sendMessage(chatId, UNSUPPORTED_MESSAGE_TYPE_MESSAGE);
      }
    } catch (error) {
      logger.error("telegram-bot:handle-update-failed", {
        error,
        chatId,
        updateId: update.update_id,
      });
      await this.safeSend(chatId, GENERIC_ERROR_MESSAGE);
    }
  }

  private async handleTextMessage(chatId: number, text: string): Promise<void> {
    const all = (await this.categories.listAll()).filter((c) => c.isActive);
    const match = matchCategory(text, all);

    if (match.type === "found") {
      await this.repo.setSessionCategoryId(chatId, match.category.id);
      await this.telegramApi.sendMessage(
        chatId,
        `Выбрано: ${categoryDisplayName(match.category, all)}. Присылайте фото.`,
      );
      return;
    }
    if (match.type === "ambiguous") {
      await this.telegramApi.sendMessage(
        chatId,
        `Не нашёл точное совпадение. Возможно, вы имели в виду: ${match.suggestions.join(", ")}`,
      );
      return;
    }
    await this.telegramApi.sendMessage(chatId, "Не нашёл такую категорию, попробуйте ещё раз.");
  }

  /**
   * Задача №265 — "Номер: X / Цена: Y". Checked (in handleUpdate) before any
   * category-name matching, since "Номер: 45" would otherwise just fail to
   * match any category and get the generic not-found reply instead of
   * being recognized as this command.
   */
  private async handlePriceCommand(chatId: number, text: string): Promise<void> {
    const { sortOrder, price } = parsePriceCommand(text);
    if (sortOrder === null || price === null) {
      await this.telegramApi.sendMessage(chatId, PRICE_COMMAND_FORMAT_MESSAGE);
      return;
    }

    const product = await this.sellerProductService.findBySortOrder(sortOrder);
    if (!product) {
      await this.telegramApi.sendMessage(
        chatId,
        `Товар с порядковым номером ${sortOrder} не найден.`,
      );
      return;
    }

    await this.sellerProductService.updateProduct(null, { id: product.id, price });
    await this.telegramApi.sendMessage(
      chatId,
      `Цена товара №${sortOrder} изменена на ${price} сом.`,
    );
  }

  private async handlePhotoMessage(chatId: number, message: TelegramMessage): Promise<void> {
    // Telegram sends every resolution it generated for this photo, smallest
    // first — the last entry is the largest/original-quality one.
    const photos = message.photo!;
    const fileId = photos[photos.length - 1].file_id;

    if (!message.media_group_id) {
      const categoryId = await this.repo.getSessionCategoryId(chatId);
      if (!categoryId) {
        await this.telegramApi.sendMessage(chatId, NO_CATEGORY_MESSAGE);
        return;
      }
      await this.createProductFromPhotos(chatId, [fileId], message.caption ?? null, categoryId);
      return;
    }

    await this.handleAlbumPhotoMessage(
      chatId,
      message.media_group_id,
      message.message_id,
      fileId,
      message.caption ?? null,
    );
  }

  /**
   * Задача №266 — one album (media_group_id) = one product. Each photo in
   * an album arrives as its OWN separate webhook delivery, sharing a
   * media_group_id but with no "this is the last one" signal from Telegram
   * — this buffers every member as it arrives (repo.addAlbumMember) and
   * uses an atomic claim (repo.claimAlbum, a PK-uniqueness race) to elect
   * exactly one of those deliveries to wait briefly and then gather+create
   * the product; every other delivery for the same group just records its
   * member row and returns immediately.
   */
  private async handleAlbumPhotoMessage(
    chatId: number,
    mediaGroupId: string,
    messageId: number,
    fileId: string,
    caption: string | null,
  ): Promise<void> {
    await this.repo.addAlbumMember({ mediaGroupId, messageId, chatId, fileId, caption });

    const categoryId = await this.repo.getSessionCategoryId(chatId);
    const claimed = await this.repo.claimAlbum(mediaGroupId, chatId, categoryId);
    if (!claimed) return; // a sibling delivery for this same album already owns processing

    if (!categoryId) {
      await this.telegramApi.sendMessage(chatId, NO_CATEGORY_MESSAGE);
      await this.repo.deleteAlbum(mediaGroupId);
      return;
    }

    // Give sibling deliveries a short window to land in the members table
    // before gathering. Deliberate trade-off, not an oversight: a
    // genuinely very slow last photo arriving after this window closes
    // is simply left out of the product's photos (its row is inserted
    // but the gather query below never reads it, and deleteAlbum below
    // removes it once this claim is done).
    await new Promise((resolve) => setTimeout(resolve, ALBUM_GATHER_DELAY_MS));

    const members = await this.repo.getAlbumMembers(mediaGroupId);
    // Already ordered by message_id ascending (the repository's own
    // query) — Telegram's real attachment order, independent of which
    // member happened to carry the caption.
    const fileIds = members.map((m) => m.fileId);
    const captionSource = members.find((m) => m.caption)?.caption ?? null;

    await this.createProductFromPhotos(chatId, fileIds, captionSource, categoryId);
    await this.repo.deleteAlbum(mediaGroupId);
  }

  /**
   * Shared by both the single-photo and album paths — fileIds is a single
   * cover photo or a whole album, already in final display order (fileIds[0]
   * becomes imageUrls[0], the product's cover).
   */
  private async createProductFromPhotos(
    chatId: number,
    fileIds: string[],
    captionText: string | null,
    categoryId: string,
  ): Promise<void> {
    const downloaded = [];
    for (const fileId of fileIds) {
      downloaded.push(await this.telegramApi.downloadFile(fileId));
    }
    const cover = downloaded[0];

    const trimmedCaption = captionText?.trim();
    const parsed = trimmedCaption ? parseCaption(trimmedCaption) : null;

    let name: string;
    let usedFallbackName = false;
    if (parsed?.name) {
      name = parsed.name;
    } else {
      // No caption at all, or a caption whose own first line was blank —
      // either way, OCR the cover photo (extends the original "no caption"
      // rule to also cover a present-but-nameless caption; the caption's
      // other labels, if any, are still respected below regardless of
      // where the name itself came from).
      const ocrText = await this.readNameFromPhoto(cover.data, cover.contentType);
      name = ocrText ?? fallbackProductName();
      usedFallbackName = !ocrText;
    }

    const imageUrls: string[] = [];
    for (const file of downloaded) {
      const upload = await this.mediaUploadService.uploadImage({
        context: MediaUploadContext.PRODUCT,
        contentType: file.contentType,
        size: file.data.length,
        // Buffer's declared type (ArrayBufferLike, which includes
        // SharedArrayBuffer) doesn't satisfy BlobPart's stricter ArrayBuffer
        // requirement — a fresh Uint8Array copy does.
        data: new Blob([new Uint8Array(file.data)], { type: file.contentType }),
      });
      imageUrls.push(upload.url);
    }

    const product = await this.sellerProductService.createProduct(null, {
      name,
      description: parsed?.description ?? undefined,
      price: parsed?.price ?? 1,
      countryOfOrigin: parsed?.countryOfOrigin ?? undefined,
      sortOrder: parsed?.sortOrder ?? undefined,
      categoryId,
      imageUrls,
      publicationStatus: ProductPublicationStatus.DRAFT,
    });

    const all = await this.categories.listAll();
    const category = all.find((c) => c.id === categoryId);
    const categoryLabel = category ? categoryDisplayName(category, all) : "";

    let reply = `Товар «${product.name}» создан как черновик${categoryLabel ? ` в разделе ${categoryLabel}` : ""}.`;
    if (usedFallbackName) {
      reply +=
        " Не удалось определить название по подписи или фото — дополните его вручную в админке.";
    }
    await this.telegramApi.sendMessage(chatId, reply);
  }

  private async readNameFromPhoto(imageData: Buffer, mimeType: string): Promise<string | null> {
    try {
      const result = await this.aiText.readTextFromImage({
        imageData,
        mimeType,
        instruction: OCR_INSTRUCTION,
      });
      return result.text;
    } catch (error) {
      logger.error("telegram-bot:ocr-failed", { error });
      return null;
    }
  }

  /** Best-effort reply — a failure to notify the user must never mask the original error. */
  private async safeSend(chatId: number, text: string): Promise<void> {
    try {
      await this.telegramApi.sendMessage(chatId, text);
    } catch (error) {
      logger.error("telegram-bot:reply-failed", { error, chatId });
    }
  }
}
