import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import * as XLSX from "xlsx";

// Middleware multer (xem src/api/middlewares.ts) đặt file upload vào (req as any).file
type UploadedRequest = MedusaRequest & { file?: { buffer: Buffer } };

const CATEGORY_MAP: Record<string, string> = {
  Lipstick: "Trang điểm",
  "Lip Gloss": "Trang điểm",
  Blush: "Trang điểm",
  Concealer: "Trang điểm",
  Mascaras: "Trang điểm",
  Powder: "Trang điểm",
  Highlighter: "Trang điểm",
  Eyeliners: "Trang điểm",
  "Face Brushes": "Trang điểm",
  "Eye Brushes": "Trang điểm",
  "Facial Cleaning Tools": "Tẩy trang",
  Cleansers: "Tẩy trang",
  "Makeup Remover": "Tẩy trang",
  Toner: "Dưỡng da",
  "Exfoliating Facial Peels": "Dưỡng da",
  "Facial Masks": "Dưỡng da",
  "Eye Care": "Dưỡng da",
  Moisturizers: "Dưỡng da",
  "Body Deodorant": "Dưỡng thể",
  "Body Cream": "Dưỡng thể",
  "Self-Tanners": "Dưỡng thể",
  "Shower & Scrubs": "Dưỡng thể",
  "Scented Candles": "Dưỡng thể",
  "Shampoos & Conditioners": "Chăm sóc tóc",
  "Styling Tools": "Chăm sóc tóc",
  "Styling Products": "Chăm sóc tóc",
  Combs: "Chăm sóc tóc",
  "Hair Curly & Textured Products": "Chăm sóc tóc",
};

const SKIN_TYPE_VI: Record<string, string> = {
  Combination: "Da hỗn hợp",
  Oily: "Da dầu",
  "All Skin Types": "Mọi loại da",
  Dry: "Da khô",
  Normal: "Da thường",
};

type AttributeEntry = { skinTypes: string[]; volumeLabel: string | null; others: { name: string; value: string }[] };

// Đọc sheet "Product attributes" (Skin Type, Net Weight/Volume, Texture, Benefits...) nếu có, gộp theo SPU.
function buildAttributesIndex(wb: XLSX.WorkBook): Map<string, AttributeEntry> {
  const sheet = wb.Sheets["Product attributes"];
  const index = new Map<string, AttributeEntry>();
  if (!sheet) return index;
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });
  for (const r of rows) {
    const spu = r.SPU;
    const name = r["attribute name"];
    const value = r["attribute value"];
    if (!spu || !name || !value) continue;
    if (!index.has(spu)) index.set(spu, { skinTypes: [], volumeLabel: null, others: [] });
    const entry = index.get(spu)!;
    if (name === "Skin Type") {
      const vi = SKIN_TYPE_VI[value] || value;
      if (!entry.skinTypes.includes(vi)) entry.skinTypes.push(vi);
    } else if (name === "Net Weight (g)") {
      entry.volumeLabel = `${value}g`;
    } else if (name === "Net Volume (ml)") {
      entry.volumeLabel = `${value}ml`;
    } else {
      entry.others.push({ name, value });
    }
  }
  return index;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function POST(req: UploadedRequest, res: MedusaResponse) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "Thiếu file. Chọn file Excel trước khi bấm Import." });
  }

  const jpyToVnd = Number((req.body as Record<string, unknown>)?.jpyToVnd) || 168;

  const productModuleService = req.scope.resolve(Modules.PRODUCT);
  const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModuleService = req.scope.resolve(Modules.FULFILLMENT);

  const [salesChannels, shippingProfiles, existingCategories] = await Promise.all([
    salesChannelModuleService.listSalesChannels({}, { take: 1 }),
    fulfillmentModuleService.listShippingProfiles({}, { take: 1 }),
    productModuleService.listProductCategories({}, { take: 100, select: ["id", "name"] }),
  ]);

  if (!salesChannels.length || !shippingProfiles.length) {
    return res.status(400).json({ message: "Chưa có Sales Channel hoặc Shipping Profile mặc định trong Medusa." });
  }
  const salesChannelId = salesChannels[0].id;
  const shippingProfileId = shippingProfiles[0].id;

  const categoryIds = new Map(existingCategories.map((c) => [c.name, c.id]));
  const neededCategoryNames = [...new Set(Object.values(CATEGORY_MAP))];
  for (const name of neededCategoryNames) {
    if (categoryIds.has(name)) continue;
    const [created] = await productModuleService.createProductCategories([{ name, is_active: true }]);
    categoryIds.set(name, created.id);
  }

  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(file.buffer, { type: "buffer" });
  } catch {
    return res.status(400).json({ message: "Không đọc được file. Kiểm tra lại định dạng .xlsx/.csv." });
  }
  const sheet = wb.Sheets["Product Information"] ?? wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });
  const attributesIndex = buildAttributesIndex(wb);

  const bySpu = new Map<string, Record<string, any>[]>();
  for (const r of rows) {
    const key = r.SPU || r["Product Number"] || r.SKU;
    if (!key) continue;
    if (!bySpu.has(key)) bySpu.set(key, []);
    bySpu.get(key)!.push(r);
  }

  const existingProducts = await productModuleService.listProducts({}, { take: 1000, select: ["id", "metadata"] });
  const existingSpus = new Set(existingProducts.map((p: any) => p.metadata?.source_spu).filter(Boolean));

  const results: { title: string; status: "created" | "skipped" | "failed"; error?: string }[] = [];

  for (const [spu, variantRows] of bySpu) {
    const first = variantRows[0];
    const title = first["Multilingual product names(en)"] || first["Product Name"] || first.Title;
    if (!title) continue;

    if (existingSpus.has(spu)) {
      results.push({ title, status: "skipped" });
      continue;
    }

    const handle = slugify(first["Product Number"] || spu);
    const categoryName = CATEGORY_MAP[first["Last-level classification"]] ?? "Dưỡng da";
    const categoryId = categoryIds.get(categoryName);

    const images: { url: string }[] = [];
    for (const r of variantRows) {
      for (const key of ["Main Image", "Detail image1", "Detail image2", "Detail image3"]) {
        if (r[key] && !images.some((i) => i.url === r[key])) images.push({ url: r[key] });
      }
    }

    const optionTitle = "Loại";
    const optionValues = [...new Set(variantRows.map((r) => r["Main Specification Value"] || "Default"))];

    const variants = variantRows.map((r: Record<string, any>) => {
      const priceJpy = Number(r["Selling price(shein-jp_JPY)"]) || 0;
      const priceVnd = Math.round((priceJpy * jpyToVnd) / 1000) * 1000;
      return {
        title: r["Main Specification Value"] || "Default",
        sku: r.SKU || r["Product Number"],
        manage_inventory: false,
        options: { [optionTitle]: r["Main Specification Value"] || "Default" },
        prices: [{ amount: priceVnd, currency_code: "vnd" }],
        metadata: { origin: "Nhật Bản", weight_g: r.Weight ?? null },
      };
    });

    const attrs = attributesIndex.get(spu);

    const payload = {
      title,
      handle,
      description: first["Default product description(ja)"] || null,
      status: "published" as const,
      sales_channels: [{ id: salesChannelId }],
      shipping_profile_id: shippingProfileId,
      categories: categoryId ? [{ id: categoryId }] : [],
      images,
      thumbnail: images[0]?.url,
      options: [{ title: optionTitle, values: optionValues }],
      variants,
      metadata: {
        brand: first["brand name"] || null,
        ja: first["Default Product Name(ja)"] || null,
        origin: "Nhật Bản",
        source: "supplier-import",
        source_spu: spu,
        skin_type: attrs?.skinTypes.length ? attrs.skinTypes.join(",") : null,
        volume_label: attrs?.volumeLabel ?? null,
        attributes: attrs?.others.length ? JSON.stringify(attrs.others) : null,
      },
    };

    try {
      await createProductsWorkflow(req.scope).run({ input: { products: [payload] } });
      results.push({ title, status: "created" });
    } catch (err) {
      // Dữ liệu nguồn đôi khi có 2 SPU khác nhau trùng Product Number — thử lại với hậu tố duy nhất.
      const suffix = spu.slice(-6);
      payload.handle = `${payload.handle}-${suffix}`;
      payload.variants = payload.variants.map((v) => ({ ...v, sku: `${v.sku}-${suffix}` }));
      try {
        await createProductsWorkflow(req.scope).run({ input: { products: [payload] } });
        results.push({ title, status: "created" });
      } catch (err2) {
        results.push({ title, status: "failed", error: (err2 as Error).message.slice(0, 300) });
      }
    }
  }

  res.json({
    total: bySpu.size,
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  });
}
