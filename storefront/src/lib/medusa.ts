import Medusa from "@medusajs/js-sdk";

// Site không bán online — chỉ dùng Medusa như nguồn dữ liệu catalog
// (đọc ở build time để sinh trang tĩnh). Không gọi API lúc runtime trên client.
const MEDUSA_BACKEND_URL = import.meta.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000";
const MEDUSA_PUBLISHABLE_KEY = import.meta.env.MEDUSA_PUBLISHABLE_KEY ?? "";

export const medusa = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: MEDUSA_PUBLISHABLE_KEY,
});

export type MedusaProduct = {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  thumbnail: string | null;
  images: { url: string }[];
  variants: {
    id: string;
    title: string;
    calculated_price?: { calculated_amount: number; currency_code: string };
  }[];
  metadata: Record<string, unknown> | null;
  categories: { id: string; name: string; handle: string }[];
  created_at: string;
};

export type MedusaCategory = { id: string; name: string; handle: string };

let defaultRegionId: string | undefined;

async function getDefaultRegionId(): Promise<string | undefined> {
  if (defaultRegionId) return defaultRegionId;
  const { regions } = await medusa.store.region.list();
  defaultRegionId = regions[0]?.id;
  return defaultRegionId;
}

/**
 * Lấy toàn bộ sản phẩm (phân trang tự động), dùng ở build time cho getStaticPaths.
 * Với vài nghìn sản phẩm, build sẽ mất vài phút — đây là đánh đổi đã chọn
 * (đổi lại: host tĩnh free, không cần server chạy 24/7 cho phần storefront).
 */
export async function getAllProducts(
  opts: { regionId?: string; categoryId?: string } = {},
): Promise<MedusaProduct[]> {
  const region_id = opts.regionId ?? (await getDefaultRegionId());
  const limit = 100;
  let offset = 0;
  let count = Infinity;
  const products: MedusaProduct[] = [];

  while (offset < count) {
    const { products: page, count: total } = await medusa.store.product.list({
      limit,
      offset,
      region_id,
      category_id: opts.categoryId,
      fields:
        "id,title,handle,description,thumbnail,metadata,created_at,*images,*variants,*variants.calculated_price,*variants.inventory_quantity,*categories",
    });
    products.push(...(page as MedusaProduct[]));
    count = total;
    offset += limit;
  }

  return products;
}

export async function getProductByHandle(handle: string): Promise<MedusaProduct | null> {
  const { products } = await medusa.store.product.list({ handle, limit: 1 });
  return (products[0] as MedusaProduct) ?? null;
}

export async function getCategories(): Promise<MedusaCategory[]> {
  const { product_categories } = await medusa.store.category.list({ fields: "id,name,handle", limit: 100 });
  return product_categories as MedusaCategory[];
}

export async function getCategoryByHandle(handle: string): Promise<MedusaCategory | null> {
  const { product_categories } = await medusa.store.category.list({ handle, limit: 1 });
  return (product_categories[0] as MedusaCategory) ?? null;
}

/**
 * Chuẩn hoá sản phẩm Medusa thành các field mà LabelStrip/ProductCard cần.
 * Nguồn dữ liệu thật (theo README) sẽ ghi các field này vào metadata sản phẩm
 * trong Medusa Admin: brand, ja, jan (13 số), volume, origin, lot, cbmp.
 * Thiếu field nào thì UI chỉ ẩn field đó, không suy đoán số liệu giả.
 */
export type CatalogItem = {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  brand: string | null;
  ja: string | null;
  jan: string | null;
  volume: string | null;
  origin: string | null;
  lot: string | null;
  cbmp: string | null;
  price: number | null;
  wasPrice: number | null;
  onSale: boolean;
  gift: string | null;
  currency: string;
  inStock: boolean;
  categories: { id: string; name: string; handle: string }[];
  createdAt: string;
  skinTypes: string[];
  attributes: { name: string; value: string }[];
};

export function toCatalogItem(product: MedusaProduct): CatalogItem {
  const meta = (product.metadata ?? {}) as Record<string, unknown>;
  const str = (key: string): string | null => {
    const v = meta[key];
    return typeof v === "string" && v.length > 0 ? v : null;
  };
  const variant = product.variants?.[0];
  const price = variant?.calculated_price;
  const calculatedAmount = price?.calculated_amount ?? null;

  // Khuyến mãi/tặng kèm đọc từ metadata (chỉnh trong Medusa Admin), độc lập với
  // engine pricing/promotion của Medusa — đơn giản hơn cho nhu cầu chỉ hiển thị.
  const metaOriginalPrice = typeof meta.original_price === "number" ? meta.original_price : null;
  const wasPrice =
    metaOriginalPrice && calculatedAmount && metaOriginalPrice > calculatedAmount ? metaOriginalPrice : null;

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    thumbnail: product.thumbnail,
    brand: str("brand"),
    ja: str("ja"),
    jan: str("jan"),
    volume: str("volume_label") ?? str("volume") ?? variant?.title ?? null,
    origin: str("origin"),
    lot: str("lot"),
    cbmp: str("cbmp"),
    price: calculatedAmount,
    wasPrice,
    onSale: wasPrice != null,
    gift: str("gift"),
    currency: price?.currency_code ?? "vnd",
    inStock: (variant as { inventory_quantity?: number } | undefined)?.inventory_quantity !== 0,
    categories: product.categories ?? [],
    createdAt: product.created_at,
    skinTypes: str("skin_type")?.split(",").filter(Boolean) ?? [],
    attributes: (() => {
      const raw = meta.attributes;
      if (typeof raw !== "string" || !raw) return [];
      try {
        return JSON.parse(raw) as { name: string; value: string }[];
      } catch {
        return [];
      }
    })(),
  };
}
