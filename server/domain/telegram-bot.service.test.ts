import { describe, expect, it, vi } from "vitest";
import {
  TelegramBotService,
  parseCaption,
  matchCategory,
  categoryDisplayName,
  fallbackProductName,
  isPriceCommand,
  parsePriceCommand,
  isBulkPriceCommand,
  parseBulkPriceCommand,
} from "@server/domain/telegram-bot.service";
import type { ITelegramBotRepository } from "@server/ports/telegram-bot.repository";
import type { ITelegramBotApi } from "@server/ports/telegram-bot-api.port";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import type { IAiTextProvider } from "@server/ports/ai-provider.port";
import type { MediaUploadService } from "@server/domain/media-upload.service";
import type { SellerProductService } from "@server/domain/seller-product.service";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";
import type { TelegramUpdate } from "@server/adapters/telegram/telegram-update.types";

function makeCategory(overrides: Partial<AdminCategoryDTO> = {}): AdminCategoryDTO {
  return {
    id: "cat-1",
    name: "Молочные продукты",
    slug: "dairy",
    description: null,
    imageUrl: null,
    sortOrder: "0",
    isActive: true,
    nameKg: null,
    parentId: null,
    ...overrides,
  };
}

describe("parseCaption", () => {
  it("splits the first line as name, the rest (before any label) as description", () => {
    expect(parseCaption("Молоко Лактель\nЖирность 3.2%\n1 литр")).toEqual({
      name: "Молоко Лактель",
      description: "Жирность 3.2%\n1 литр",
      price: null,
      countryOfOrigin: null,
      sortOrder: null,
    });
  });

  it("returns a null description when the caption is a single line", () => {
    expect(parseCaption("Молоко Лактель")).toEqual({
      name: "Молоко Лактель",
      description: null,
      price: null,
      countryOfOrigin: null,
      sortOrder: null,
    });
  });

  it("trims whitespace on both name and description", () => {
    expect(parseCaption("  Молоко  \n  Жирность 3.2%  ")).toEqual({
      name: "Молоко",
      description: "Жирность 3.2%",
      price: null,
      countryOfOrigin: null,
      sortOrder: null,
    });
  });

  it("parses all three labels regardless of order, after the description", () => {
    expect(
      parseCaption("Простоквашино 1л\nЖирность 3.2%\nНомер: 45\nЦена: 200\nСтрана: Россия"),
    ).toEqual({
      name: "Простоквашино 1л",
      description: "Жирность 3.2%",
      price: 200,
      countryOfOrigin: "Россия",
      sortOrder: "45",
    });
  });

  it("parses labels in a different order just as well", () => {
    expect(parseCaption("Молоко\nСтрана: Россия\nНомер: 12\nЦена: 99")).toEqual({
      name: "Молоко",
      description: null,
      price: 99,
      countryOfOrigin: "Россия",
      sortOrder: "12",
    });
  });

  it("keeps sortOrder as an exact decimal string, never a rounded JS number", () => {
    expect(parseCaption("Молоко\nНомер: 1.15555555555")).toEqual({
      name: "Молоко",
      description: null,
      price: null,
      countryOfOrigin: null,
      sortOrder: "1.15555555555",
    });
  });

  it("accepts a comma decimal separator for price", () => {
    expect(parseCaption("Молоко\nЦена: 199,99")).toEqual({
      name: "Молоко",
      description: null,
      price: 199.99,
      countryOfOrigin: null,
      sortOrder: null,
    });
  });

  it("defaults every label to null when none are present", () => {
    expect(parseCaption("Просто название")).toEqual({
      name: "Просто название",
      description: null,
      price: null,
      countryOfOrigin: null,
      sortOrder: null,
    });
  });

  it("only takes description lines up to the first label, not after", () => {
    expect(parseCaption("Молоко\nОписание строка 1\nЦена: 200\nОписание строка 2")).toEqual({
      name: "Молоко",
      description: "Описание строка 1",
      price: 200,
      countryOfOrigin: null,
      sortOrder: null,
    });
  });

  it("ignores an unrecognized label-shaped line inside the label section", () => {
    expect(parseCaption("Молоко\nЦена: 200\nВкус: сливочный")).toEqual({
      name: "Молоко",
      description: null,
      price: 200,
      countryOfOrigin: null,
      sortOrder: null,
    });
  });
});

describe("fallbackProductName", () => {
  it("includes a date/time stamp so duplicates stay distinguishable", () => {
    const name = fallbackProductName(new Date(2026, 8, 11, 14, 5));
    expect(name).toBe("Без названия 2026-09-11 14:05");
  });
});

describe("matchCategory", () => {
  const dairy = makeCategory({ id: "cat-1", name: "Молочные продукты" });
  const bakery = makeCategory({
    id: "cat-2",
    name: "Хлебобулочные изделия",
    nameKg: "Нан азыктары",
  });
  const dairyMilk = makeCategory({ id: "cat-3", name: "Молоко", parentId: "cat-1" });
  const all = [dairy, bakery, dairyMilk];

  it("matches exactly by name, case/whitespace-insensitive", () => {
    expect(matchCategory("  молочные продукты  ", all)).toEqual({ type: "found", category: dairy });
  });

  it("matches exactly by nameKg", () => {
    expect(matchCategory("Нан азыктары", all)).toEqual({ type: "found", category: bakery });
  });

  it("falls back to a substring match for a close-enough name", () => {
    expect(matchCategory("Молочка", all)).toEqual({ type: "not_found" }); // no substring relation either way
    expect(matchCategory("Молочные", all)).toEqual({ type: "found", category: dairy });
  });

  it("reports ambiguous when the input is a substring of more than one category name", () => {
    const milkProducts = makeCategory({ id: "cat-4", name: "Молочные продукты" });
    const milkDrinks = makeCategory({ id: "cat-5", name: "Молочные напитки" });
    const result = matchCategory("Молочные", [milkProducts, milkDrinks]);
    expect(result.type).toBe("ambiguous");
  });

  it("reports not_found for a category that doesn't exist", () => {
    expect(matchCategory("Электроника", all)).toEqual({ type: "not_found" });
  });

  it("reports not_found for empty/whitespace-only input", () => {
    expect(matchCategory("   ", all)).toEqual({ type: "not_found" });
  });
});

describe("categoryDisplayName", () => {
  const parent = makeCategory({ id: "cat-1", name: "Молочные продукты", parentId: null });
  const child = makeCategory({ id: "cat-3", name: "Молоко", parentId: "cat-1" });
  const all = [parent, child];

  it("returns just the name for a top-level category", () => {
    expect(categoryDisplayName(parent, all)).toBe("Молочные продукты");
  });

  it("returns 'Parent → Child' for a subcategory", () => {
    expect(categoryDisplayName(child, all)).toBe("Молочные продукты → Молоко");
  });
});

describe("isPriceCommand", () => {
  it("recognizes a message starting with 'Номер:'", () => {
    expect(isPriceCommand("Номер: 45\nЦена: 200")).toBe(true);
  });

  it("does not treat a category name as a price command", () => {
    expect(isPriceCommand("Молочные продукты")).toBe(false);
  });

  it("ignores leading whitespace", () => {
    expect(isPriceCommand("  Номер: 45")).toBe(true);
  });
});

describe("parsePriceCommand", () => {
  it("parses sortOrder as a decimal string and price as a number", () => {
    expect(parsePriceCommand("Номер: 45\nЦена: 200")).toEqual({ sortOrder: "45", price: 200 });
  });

  it("keeps a fractional sortOrder as an exact string, never a rounded JS number", () => {
    expect(parsePriceCommand("Номер: 1.15555555555\nЦена: 50")).toEqual({
      sortOrder: "1.15555555555",
      price: 50,
    });
  });

  it("accepts a comma decimal separator for price", () => {
    expect(parsePriceCommand("Номер: 45\nЦена: 199,99")).toEqual({
      sortOrder: "45",
      price: 199.99,
    });
  });

  it("returns a null price when 'Цена:' is absent", () => {
    expect(parsePriceCommand("Номер: 45")).toEqual({ sortOrder: "45", price: null });
  });

  it("returns a null price when the price value isn't a valid number", () => {
    expect(parsePriceCommand("Номер: 45\nЦена: бесплатно")).toEqual({
      sortOrder: "45",
      price: null,
    });
  });

  it("returns a null sortOrder when 'Номер:' is absent", () => {
    expect(parsePriceCommand("Цена: 200")).toEqual({ sortOrder: null, price: 200 });
  });
});

describe("isBulkPriceCommand", () => {
  it("recognizes a single 'number:price' line", () => {
    expect(isBulkPriceCommand("45:200")).toBe(true);
  });

  it("recognizes several lines, including a fractional sortOrder", () => {
    expect(isBulkPriceCommand("45:200\n46:150\n45.5:180")).toBe(true);
  });

  it("ignores blank lines between valid ones", () => {
    expect(isBulkPriceCommand("45:200\n\n46:150")).toBe(true);
  });

  it("rejects a plain category name", () => {
    expect(isBulkPriceCommand("Молочные продукты")).toBe(false);
  });

  it("rejects the labeled 'Номер:'/'Цена:' single-price command", () => {
    expect(isBulkPriceCommand("Номер: 45\nЦена: 200")).toBe(false);
  });

  it("rejects the whole message if even one line doesn't match", () => {
    expect(isBulkPriceCommand("45:200\nне число")).toBe(false);
  });

  it("rejects an empty message", () => {
    expect(isBulkPriceCommand("")).toBe(false);
  });

  it("rejects a comma decimal separator (dot only)", () => {
    expect(isBulkPriceCommand("45,5:200")).toBe(false);
  });
});

describe("parseBulkPriceCommand", () => {
  it("parses each line's sortOrder as a string and price as a number", () => {
    expect(parseBulkPriceCommand("45:200\n46:150\n45.5:180")).toEqual([
      { sortOrder: "45", price: 200 },
      { sortOrder: "46", price: 150 },
      { sortOrder: "45.5", price: 180 },
    ]);
  });

  it("skips blank lines", () => {
    expect(parseBulkPriceCommand("45:200\n\n46:150")).toEqual([
      { sortOrder: "45", price: 200 },
      { sortOrder: "46", price: 150 },
    ]);
  });
});

function makeService(
  overrides: {
    repo?: Partial<ITelegramBotRepository>;
    telegramApi?: Partial<ITelegramBotApi>;
    categories?: Partial<IAdminCategoryRepository>;
    aiText?: Partial<IAiTextProvider>;
    mediaUploadService?: Partial<MediaUploadService>;
    sellerProductService?: Partial<SellerProductService>;
  } = {},
) {
  const repo: ITelegramBotRepository = {
    findAdmin: vi.fn().mockResolvedValue({ telegramUserId: 7718528454, name: "Данияр" }),
    listAdminIds: vi.fn().mockResolvedValue([7718528454]),
    getSessionCategoryId: vi.fn().mockResolvedValue(null),
    setSessionCategoryId: vi.fn().mockResolvedValue(undefined),
    markUpdateProcessed: vi.fn().mockResolvedValue(true),
    addAlbumMember: vi.fn().mockResolvedValue(undefined),
    claimAlbum: vi.fn().mockResolvedValue(true),
    getAlbumMembers: vi.fn().mockResolvedValue([]),
    deleteAlbum: vi.fn().mockResolvedValue(undefined),
    ...overrides.repo,
  };
  const telegramApi: ITelegramBotApi = {
    sendMessage: vi.fn().mockResolvedValue(undefined),
    downloadFile: vi
      .fn()
      .mockResolvedValue({ data: Buffer.from("fake"), contentType: "image/jpeg" }),
    ...overrides.telegramApi,
  };
  const categories: IAdminCategoryRepository = {
    listAll: vi.fn().mockResolvedValue([makeCategory()]),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    slugExists: vi.fn(),
    findBySortOrder: vi.fn(),
    ...overrides.categories,
  };
  const aiText: IAiTextProvider = {
    translateText: vi.fn(),
    readTextFromImage: vi.fn().mockResolvedValue({ text: null }),
    ...overrides.aiText,
  };
  const mediaUploadService = {
    uploadImage: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/photo.jpg" }),
    ...overrides.mediaUploadService,
  } as MediaUploadService;
  const sellerProductService = {
    createProduct: vi.fn().mockResolvedValue({
      id: "product-1",
      name: "Товар",
      slug: "tovar",
      publicationStatus: "PUBLISHED",
    }),
    findBySortOrder: vi.fn().mockResolvedValue(null),
    updateProduct: vi.fn().mockResolvedValue({ id: "product-1", name: "Товар" }),
    ...overrides.sellerProductService,
  } as unknown as SellerProductService;

  const service = new TelegramBotService(
    repo,
    telegramApi,
    categories,
    aiText,
    mediaUploadService,
    sellerProductService,
  );
  return {
    service,
    repo,
    telegramApi,
    categories,
    aiText,
    mediaUploadService,
    sellerProductService,
  };
}

function makeUpdate(message: TelegramUpdate["message"], updateId = 1): TelegramUpdate {
  return { update_id: updateId, message };
}

describe("TelegramBotService.handleUpdate — access control", () => {
  it("rejects an update from a telegram_user_id not in the allow-list", async () => {
    const { service, repo, telegramApi } = makeService({
      repo: { findAdmin: vi.fn().mockResolvedValue(null) },
    });
    await service.handleUpdate(
      makeUpdate({ message_id: 1, from: { id: 111 }, chat: { id: 999 }, text: "Молоко" }),
    );

    expect(repo.findAdmin).toHaveBeenCalledWith(111);
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(999, "У вас нет доступа");
  });

  it("proceeds when the telegram_user_id is a known admin", async () => {
    const { service, telegramApi } = makeService();
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "Молочные продукты",
      }),
    );

    expect(telegramApi.sendMessage).not.toHaveBeenCalledWith(999, "У вас нет доступа");
  });
});

describe("TelegramBotService.handleUpdate — idempotency", () => {
  it("skips processing entirely on a redelivered update_id", async () => {
    const { service, repo, telegramApi } = makeService({
      repo: { markUpdateProcessed: vi.fn().mockResolvedValue(false) },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "Молочные продукты",
      }),
    );

    expect(repo.findAdmin).not.toHaveBeenCalled();
    expect(telegramApi.sendMessage).not.toHaveBeenCalled();
  });
});

describe("TelegramBotService.handleUpdate — text (category selection)", () => {
  it("selects a matching category and saves it to the session", async () => {
    const { service, repo, telegramApi } = makeService({
      categories: {
        listAll: vi
          .fn()
          .mockResolvedValue([makeCategory({ id: "cat-1", name: "Молочные продукты" })]),
      },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "Молочные продукты",
      }),
    );

    expect(repo.setSessionCategoryId).toHaveBeenCalledWith(999, "cat-1");
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      expect.stringContaining("Выбрано: Молочные продукты"),
    );
  });

  it("replies with a not-found message for an unmatched category name", async () => {
    const { service, telegramApi } = makeService({
      categories: {
        listAll: vi.fn().mockResolvedValue([makeCategory({ name: "Молочные продукты" })]),
      },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "Электроника",
      }),
    );

    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      "Не нашёл такую категорию, попробуйте ещё раз.",
    );
  });

  it("treats a 'Номер:' message as a price command, never as a category name", async () => {
    const { service, categories, sellerProductService, telegramApi } = makeService({
      sellerProductService: {
        findBySortOrder: vi.fn().mockResolvedValue({ id: "product-45", name: "Молоко" }),
      },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "Номер: 45\nЦена: 200",
      }),
    );

    expect(categories.listAll).not.toHaveBeenCalled();
    expect(sellerProductService.updateProduct).toHaveBeenCalledWith(null, {
      id: "product-45",
      price: 200,
    });
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      "Цена товара №45 изменена на 200 сом.",
    );
  });
});

describe("TelegramBotService.handleUpdate — price-change command", () => {
  it("finds the product by its exact decimal sortOrder and updates the price", async () => {
    const { service, sellerProductService, telegramApi } = makeService({
      sellerProductService: {
        findBySortOrder: vi.fn().mockResolvedValue({ id: "product-45", name: "Молоко" }),
      },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "Номер: 45\nЦена: 200",
      }),
    );

    expect(sellerProductService.findBySortOrder).toHaveBeenCalledWith("45");
    expect(sellerProductService.updateProduct).toHaveBeenCalledWith(null, {
      id: "product-45",
      price: 200,
    });
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      "Цена товара №45 изменена на 200 сом.",
    );
  });

  it("replies 'not found' and changes nothing when the sortOrder doesn't match a product", async () => {
    const { service, sellerProductService, telegramApi } = makeService({
      sellerProductService: { findBySortOrder: vi.fn().mockResolvedValue(null) },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "Номер: 999\nЦена: 200",
      }),
    );

    expect(sellerProductService.updateProduct).not.toHaveBeenCalled();
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      "Товар с порядковым номером 999 не найден.",
    );
  });

  it("explains the format and changes nothing when 'Цена:' is missing", async () => {
    const { service, sellerProductService, telegramApi } = makeService();
    await service.handleUpdate(
      makeUpdate({ message_id: 1, from: { id: 7718528454 }, chat: { id: 999 }, text: "Номер: 45" }),
    );

    expect(sellerProductService.findBySortOrder).not.toHaveBeenCalled();
    expect(sellerProductService.updateProduct).not.toHaveBeenCalled();
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      expect.stringContaining("Чтобы изменить цену"),
    );
  });

  it("preserves a fractional sortOrder exactly, never rounding it through a JS number", async () => {
    const { service, sellerProductService } = makeService({
      sellerProductService: {
        findBySortOrder: vi.fn().mockResolvedValue({ id: "product-x", name: "X" }),
      },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "Номер: 1.15555555555\nЦена: 50",
      }),
    );

    expect(sellerProductService.findBySortOrder).toHaveBeenCalledWith("1.15555555555");
  });
});

describe("TelegramBotService.handleUpdate — bulk price-change command", () => {
  it("updates every line and reports 'N из N' when all sortOrders are found", async () => {
    const { service, sellerProductService, telegramApi } = makeService({
      sellerProductService: {
        findBySortOrder: vi
          .fn()
          .mockImplementation((sortOrder: string) =>
            Promise.resolve({ id: `product-${sortOrder}`, name: sortOrder }),
          ),
      },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "45:200\n46:150\n45.5:180",
      }),
    );

    expect(sellerProductService.findBySortOrder).toHaveBeenCalledWith("45");
    expect(sellerProductService.findBySortOrder).toHaveBeenCalledWith("46");
    expect(sellerProductService.findBySortOrder).toHaveBeenCalledWith("45.5");
    expect(sellerProductService.updateProduct).toHaveBeenCalledWith(null, {
      id: "product-45",
      price: 200,
    });
    expect(sellerProductService.updateProduct).toHaveBeenCalledWith(null, {
      id: "product-46",
      price: 150,
    });
    expect(sellerProductService.updateProduct).toHaveBeenCalledWith(null, {
      id: "product-45.5",
      price: 180,
    });
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(999, "Обновлено цен: 3 из 3.");
  });

  it("updates the found lines and lists the missing sortOrder separately, without stopping", async () => {
    const { service, sellerProductService, telegramApi } = makeService({
      sellerProductService: {
        findBySortOrder: vi
          .fn()
          .mockImplementation((sortOrder: string) =>
            Promise.resolve(
              sortOrder === "999" ? null : { id: `product-${sortOrder}`, name: sortOrder },
            ),
          ),
      },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "45:200\n999:150\n45.5:180",
      }),
    );

    expect(sellerProductService.updateProduct).toHaveBeenCalledTimes(2);
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      "Обновлено цен: 2 из 3.\nНе удалось:\n№999 — товар не найден",
    );
  });

  it("never treats a category name as a bulk price command", async () => {
    const { service, categories, sellerProductService } = makeService();
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        text: "Молочные продукты",
      }),
    );

    expect(sellerProductService.findBySortOrder).not.toHaveBeenCalled();
    expect(categories.listAll).toHaveBeenCalled();
  });
});

describe("TelegramBotService.handleUpdate — photo (product creation)", () => {
  it("requires a category to be selected first", async () => {
    const { service, telegramApi, sellerProductService } = makeService({
      repo: { getSessionCategoryId: vi.fn().mockResolvedValue(null) },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "f1", width: 100, height: 100 }],
      }),
    );

    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      "Сначала укажите категорию/подкатегорию.",
    );
    expect(sellerProductService.createProduct).not.toHaveBeenCalled();
  });

  it("uses the caption's first line as name and creates a DRAFT product at price 1", async () => {
    const { service, sellerProductService, telegramApi } = makeService({
      repo: { getSessionCategoryId: vi.fn().mockResolvedValue("cat-1") },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "f1", width: 100, height: 100 }],
        caption: "Молоко Лактель\nЖирность 3.2%",
      }),
    );

    expect(sellerProductService.createProduct).toHaveBeenCalledWith(null, {
      name: "Молоко Лактель",
      description: "Жирность 3.2%",
      price: 1,
      categoryId: "cat-1",
      imageUrls: ["https://cdn.example.com/photo.jpg"],
      publicationStatus: "PUBLISHED",
    });
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      expect.stringContaining("опубликован"),
    );
  });

  it("falls back to OCR when there's no caption", async () => {
    const { service, sellerProductService, aiText } = makeService({
      repo: { getSessionCategoryId: vi.fn().mockResolvedValue("cat-1") },
      aiText: { readTextFromImage: vi.fn().mockResolvedValue({ text: "Крахмал картофельный" }) },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "f1", width: 100, height: 100 }],
      }),
    );

    expect(aiText.readTextFromImage).toHaveBeenCalled();
    expect(sellerProductService.createProduct).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ name: "Крахмал картофельный" }),
    );
  });

  it("uses a placeholder name and warns the admin when neither caption nor OCR finds a name", async () => {
    const { service, sellerProductService, telegramApi } = makeService({
      repo: { getSessionCategoryId: vi.fn().mockResolvedValue("cat-1") },
      aiText: { readTextFromImage: vi.fn().mockResolvedValue({ text: null }) },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "f1", width: 100, height: 100 }],
      }),
    );

    expect(sellerProductService.createProduct).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ name: expect.stringContaining("Без названия") }),
    );
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      expect.stringContaining("Не удалось определить название"),
    );
  });

  it("parses the new label caption format (price/country/sortOrder) for a single photo", async () => {
    const { service, sellerProductService } = makeService({
      repo: { getSessionCategoryId: vi.fn().mockResolvedValue("cat-1") },
    });
    await service.handleUpdate(
      makeUpdate({
        message_id: 1,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "f1", width: 100, height: 100 }],
        caption: "Простоквашино 1л\nЖирность 3.2%\nЦена: 85\nСтрана: Россия\nНомер: 12",
      }),
    );

    expect(sellerProductService.createProduct).toHaveBeenCalledWith(null, {
      name: "Простоквашино 1л",
      description: "Жирность 3.2%",
      price: 85,
      countryOfOrigin: "Россия",
      sortOrder: "12",
      categoryId: "cat-1",
      imageUrls: ["https://cdn.example.com/photo.jpg"],
      publicationStatus: "PUBLISHED",
    });
  });
});

describe("TelegramBotService.handleUpdate — album (media_group_id)", () => {
  async function handleWithFakeTimer(service: TelegramBotService, update: TelegramUpdate) {
    vi.useFakeTimers();
    try {
      const promise = service.handleUpdate(update);
      await vi.advanceTimersByTimeAsync(2000);
      await promise;
    } finally {
      vi.useRealTimers();
    }
  }

  it("creates one product from all album members, sorted by message_id, first photo as cover", async () => {
    const { service, sellerProductService, mediaUploadService, telegramApi } = makeService({
      repo: {
        getSessionCategoryId: vi.fn().mockResolvedValue("cat-1"),
        claimAlbum: vi.fn().mockResolvedValue(true),
        getAlbumMembers: vi.fn().mockResolvedValue([
          { messageId: 101, fileId: "cover-file", caption: "Простоквашино 1л\nЦена: 85" },
          { messageId: 102, fileId: "second-file", caption: null },
        ]),
      },
      mediaUploadService: {
        uploadImage: vi
          .fn()
          .mockResolvedValueOnce({ url: "https://cdn.example.com/cover.jpg" })
          .mockResolvedValueOnce({ url: "https://cdn.example.com/second.jpg" }),
      },
    });

    await handleWithFakeTimer(
      service,
      makeUpdate({
        message_id: 101,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "cover-file", width: 100, height: 100 }],
        media_group_id: "album-1",
        caption: "Простоквашино 1л\nЦена: 85",
      }),
    );

    expect(sellerProductService.createProduct).toHaveBeenCalledWith(null, {
      name: "Простоквашино 1л",
      description: undefined,
      price: 85,
      countryOfOrigin: undefined,
      sortOrder: undefined,
      categoryId: "cat-1",
      imageUrls: ["https://cdn.example.com/cover.jpg", "https://cdn.example.com/second.jpg"],
      publicationStatus: "PUBLISHED",
    });
    expect(mediaUploadService.uploadImage).toHaveBeenCalledTimes(2);
    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      expect.stringContaining("опубликован"),
    );
  });

  it("uses the caption from whichever member carries it, not necessarily the first", async () => {
    const { service, sellerProductService } = makeService({
      repo: {
        getSessionCategoryId: vi.fn().mockResolvedValue("cat-1"),
        claimAlbum: vi.fn().mockResolvedValue(true),
        getAlbumMembers: vi.fn().mockResolvedValue([
          { messageId: 101, fileId: "cover-file", caption: null },
          { messageId: 102, fileId: "second-file", caption: "Хлеб бородинский" },
        ]),
      },
    });

    await handleWithFakeTimer(
      service,
      makeUpdate({
        message_id: 102,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "second-file", width: 100, height: 100 }],
        media_group_id: "album-2",
        caption: "Хлеб бородинский",
      }),
    );

    expect(sellerProductService.createProduct).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        name: "Хлеб бородинский",
        imageUrls: ["https://cdn.example.com/photo.jpg", "https://cdn.example.com/photo.jpg"],
      }),
    );
  });

  it("a non-claiming delivery for the same album just records its member and does nothing else", async () => {
    const { service, repo, sellerProductService, telegramApi } = makeService({
      repo: { claimAlbum: vi.fn().mockResolvedValue(false) },
    });

    await service.handleUpdate(
      makeUpdate({
        message_id: 103,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "f3", width: 100, height: 100 }],
        media_group_id: "album-3",
      }),
    );

    expect(repo.addAlbumMember).toHaveBeenCalledWith({
      mediaGroupId: "album-3",
      messageId: 103,
      chatId: 999,
      fileId: "f3",
      caption: null,
    });
    expect(sellerProductService.createProduct).not.toHaveBeenCalled();
    expect(telegramApi.sendMessage).not.toHaveBeenCalled();
  });

  it("warns and cleans up (no product created) when no category is selected for the album", async () => {
    const { service, repo, sellerProductService, telegramApi } = makeService({
      repo: {
        getSessionCategoryId: vi.fn().mockResolvedValue(null),
        claimAlbum: vi.fn().mockResolvedValue(true),
      },
    });

    await service.handleUpdate(
      makeUpdate({
        message_id: 104,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "f4", width: 100, height: 100 }],
        media_group_id: "album-4",
      }),
    );

    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      "Сначала укажите категорию/подкатегорию.",
    );
    expect(sellerProductService.createProduct).not.toHaveBeenCalled();
    expect(repo.deleteAlbum).toHaveBeenCalledWith("album-4");
  });

  it("cleans up the album's buffered rows after successfully creating the product", async () => {
    const { service, repo } = makeService({
      repo: {
        getSessionCategoryId: vi.fn().mockResolvedValue("cat-1"),
        claimAlbum: vi.fn().mockResolvedValue(true),
        getAlbumMembers: vi
          .fn()
          .mockResolvedValue([{ messageId: 105, fileId: "f5", caption: "Товар" }]),
      },
    });

    await handleWithFakeTimer(
      service,
      makeUpdate({
        message_id: 105,
        from: { id: 7718528454 },
        chat: { id: 999 },
        photo: [{ file_id: "f5", width: 100, height: 100 }],
        media_group_id: "album-5",
        caption: "Товар",
      }),
    );

    expect(repo.deleteAlbum).toHaveBeenCalledWith("album-5");
  });
});

describe("TelegramBotService.handleUpdate — unsupported content", () => {
  it("politely explains what it understands for anything else", async () => {
    const { service, telegramApi } = makeService();
    await service.handleUpdate(
      makeUpdate({ message_id: 1, from: { id: 7718528454 }, chat: { id: 999 } }),
    );

    expect(telegramApi.sendMessage).toHaveBeenCalledWith(
      999,
      expect.stringContaining("понимаю только текст"),
    );
  });
});
