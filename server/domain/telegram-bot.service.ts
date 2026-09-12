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
  "Я понимаю только текст с названием раздела (категории/подкатегории) и фото товара — к фото можно (не обязательно) приложить подпись: первая строка — название, остальное — описание.";
const GENERIC_ERROR_MESSAGE =
  "Что-то пошло не так при обработке. Попробуйте ещё раз, или напишите админу платформы.";
const MAX_CATEGORY_SUGGESTIONS = 5;

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

export function parseCaption(caption: string): { name: string; description: string | null } {
  const lines = caption.split("\n");
  const name = lines[0]?.trim() ?? "";
  const description = lines.slice(1).join("\n").trim() || null;
  return { name, description };
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
    const categoryId = await this.repo.getSessionCategoryId(chatId);
    if (!categoryId) {
      await this.telegramApi.sendMessage(chatId, NO_CATEGORY_MESSAGE);
      return;
    }

    // Telegram sends every resolution it generated for this photo, smallest
    // first — the last entry is the largest/original-quality one.
    const photos = message.photo!;
    const file = await this.telegramApi.downloadFile(photos[photos.length - 1].file_id);

    const caption = message.caption?.trim();
    const parsedCaption = caption ? parseCaption(caption) : null;

    let name: string;
    let description: string | null = null;
    let usedFallbackName = false;

    if (parsedCaption?.name) {
      name = parsedCaption.name;
      description = parsedCaption.description;
    } else {
      const ocrText = await this.readNameFromPhoto(file.data, file.contentType);
      if (ocrText) {
        name = ocrText;
      } else {
        name = fallbackProductName();
        usedFallbackName = true;
      }
    }

    const upload = await this.mediaUploadService.uploadImage({
      context: MediaUploadContext.PRODUCT,
      contentType: file.contentType,
      size: file.data.length,
      // Buffer's declared type (ArrayBufferLike, which includes
      // SharedArrayBuffer) doesn't satisfy BlobPart's stricter ArrayBuffer
      // requirement — a fresh Uint8Array copy does.
      data: new Blob([new Uint8Array(file.data)], { type: file.contentType }),
    });

    const product = await this.sellerProductService.createProduct(null, {
      name,
      description: description ?? undefined,
      price: 1,
      categoryId,
      imageUrls: [upload.url],
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
