// Script nhập catalog Sisley từ file xlsx export (marketplace SHEIN-JP) vào Medusa.
// Chạy: node import-sisley.js
// Yêu cầu: backend Medusa đang chạy ở localhost:9000, admin đã có sẵn.
const XLSX = require("xlsx");

const BASE = "http://localhost:9000";
const XLSX_PATH = "C:\\Users\\ShueiHCM\\Downloads\\Export Products_2026-08-20 11_49_22_Sisley.xlsx";
const JPY_TO_VND = 168; // Tỷ giá ước lượng, không cộng thêm phí — chỉnh lại trong Admin nếu cần.

const CATEGORY_MAP = {
  "Lipstick": "Trang điểm",
  "Lip Gloss": "Trang điểm",
  "Blush": "Trang điểm",
  "Concealer": "Trang điểm",
  "Mascaras": "Trang điểm",
  "Powder": "Trang điểm",
  "Highlighter": "Trang điểm",
  "Eyeliners": "Trang điểm",
  "Face Brushes": "Trang điểm",
  "Eye Brushes": "Trang điểm",
  "Facial Cleaning Tools": "Tẩy trang",
  "Cleansers": "Tẩy trang",
  "Makeup Remover": "Tẩy trang",
  "Toner": "Dưỡng da",
  "Exfoliating Facial Peels": "Dưỡng da",
  "Facial Masks": "Dưỡng da",
  "Eye Care": "Dưỡng da",
  "Moisturizers": "Dưỡng da",
  "Body Deodorant": "Dưỡng thể",
  "Body Cream": "Dưỡng thể",
  "Self-Tanners": "Dưỡng thể",
  "Shower & Scrubs": "Dưỡng thể",
  "Scented Candles": "Dưỡng thể",
  "Shampoos & Conditioners": "Chăm sóc tóc",
  "Styling Tools": "Chăm sóc tóc",
  "Styling Products": "Chăm sóc tóc",
  "Combs": "Chăm sóc tóc",
  "Hair Curly & Textured Products": "Chăm sóc tóc",
};
const CATEGORY_NAMES = ["Dưỡng da", "Chống nắng", "Tẩy trang", "Trang điểm", "Dưỡng thể", "Chăm sóc tóc"];

const SKIN_TYPE_VI = {
  Combination: "Da hỗn hợp",
  Oily: "Da dầu",
  "All Skin Types": "Mọi loại da",
  Dry: "Da khô",
  Normal: "Da thường",
};

// Đọc sheet "Product attributes" — chứa Skin Type, Net Weight/Volume, Texture, Benefits...
// gộp theo SPU để đính vào metadata sản phẩm.
function buildAttributesIndex(wb) {
  const sheet = wb.Sheets["Product attributes"];
  const index = new Map();
  if (!sheet) return index;
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  for (const r of rows) {
    const spu = r.SPU;
    const name = r["attribute name"];
    const value = r["attribute value"];
    if (!spu || !name || !value) continue;
    if (!index.has(spu)) index.set(spu, { skinTypes: [], volumeLabel: null, others: [] });
    const entry = index.get(spu);
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

async function login() {
  const res = await fetch(`${BASE}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@jlb.local", password: "JlbAdmin123!" }),
  });
  const { token } = await res.json();
  return token;
}

async function api(token, path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function ensureCategories(token) {
  const { product_categories } = await api(token, "/admin/product-categories?limit=100");
  const byName = new Map(product_categories.map((c) => [c.name, c.id]));
  for (const name of CATEGORY_NAMES) {
    if (byName.has(name)) continue;
    const { product_category } = await api(token, "/admin/product-categories", {
      method: "POST",
      body: JSON.stringify({ name, is_active: true }),
    });
    byName.set(name, product_category.id);
    console.log("created category", name);
  }
  return byName;
}

async function main() {
  const token = await login();
  console.log("logged in");

  const [{ sales_channels }, { shipping_profiles }] = await Promise.all([
    api(token, "/admin/sales-channels"),
    api(token, "/admin/shipping-profiles"),
  ]);
  const salesChannelId = sales_channels[0].id;
  const shippingProfileId = shipping_profiles[0].id;

  const categoryIds = await ensureCategories(token);

  const wb = XLSX.readFile(XLSX_PATH);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets["Product Information"], { defval: null });
  const attributesIndex = buildAttributesIndex(wb);

  const bySpu = new Map();
  for (const r of rows) {
    if (!bySpu.has(r.SPU)) bySpu.set(r.SPU, []);
    bySpu.get(r.SPU).push(r);
  }

  const { products: existing } = await api(token, "/admin/products?limit=200&fields=id,metadata");
  const existingSpus = new Set(existing.map((p) => p.metadata?.source_spu).filter(Boolean));

  let ok = 0;
  let failed = 0;
  for (const [spu, variantRows] of bySpu) {
    if (existingSpus.has(spu)) continue;
    const first = variantRows[0];
    const title = first["Multilingual product names(en)"];
    const handle = slugify(first["Product Number"] || spu);
    const categoryName = CATEGORY_MAP[first["Last-level classification"]] ?? "Dưỡng da";
    const categoryId = categoryIds.get(categoryName);

    const images = [];
    for (const r of variantRows) {
      for (const key of ["Main Image", "Detail image1", "Detail image2", "Detail image3"]) {
        if (r[key] && !images.some((i) => i.url === r[key])) images.push({ url: r[key] });
      }
    }

    const hasOptions = variantRows.length > 1 || (first["Main Specification Value"] && first["Main Specification Value"] !== "1 pc");
    const options = hasOptions
      ? [{ title: "Màu/Loại", values: [...new Set(variantRows.map((r) => r["Main Specification Value"] || "Default"))] }]
      : [{ title: "Loại", values: ["Default"] }];

    const variants = variantRows.map((r) => {
      const priceJpy = Number(r["Selling price(shein-jp_JPY)"]) || 0;
      const priceVnd = Math.round((priceJpy * JPY_TO_VND) / 1000) * 1000;
      return {
        title: r["Main Specification Value"] || "Default",
        sku: r.SKU || r["Product Number"],
        manage_inventory: false,
        options: { [options[0].title]: r["Main Specification Value"] || "Default" },
        prices: [{ amount: priceVnd, currency_code: "vnd" }],
        metadata: {
          origin: "Nhật Bản",
          weight_g: r.Weight || null,
        },
      };
    });

    const attrs = attributesIndex.get(spu);

    const payload = {
      title,
      handle,
      description: first["Default product description(ja)"] || null,
      status: "published",
      sales_channels: [{ id: salesChannelId }],
      shipping_profile_id: shippingProfileId,
      categories: categoryId ? [{ id: categoryId }] : [],
      images,
      thumbnail: images[0]?.url,
      options,
      variants,
      metadata: {
        brand: first["brand name"] || "Sisley",
        ja: first["Default Product Name(ja)"] || null,
        origin: "Nhật Bản",
        source: "shein-jp-export",
        source_spu: spu,
        skin_type: attrs?.skinTypes.length ? attrs.skinTypes.join(",") : null,
        volume_label: attrs?.volumeLabel ?? null,
        attributes: attrs?.others.length ? JSON.stringify(attrs.others) : null,
      },
    };

    try {
      await api(token, "/admin/products", { method: "POST", body: JSON.stringify(payload) });
      ok++;
      console.log("created:", title);
    } catch (err) {
      // Dữ liệu nguồn có vài SKU/handle trùng nhau giữa các SPU khác nhau — thử lại với hậu tố duy nhất.
      const suffix = spu.slice(-6);
      payload.handle = `${payload.handle}-${suffix}`;
      payload.variants = payload.variants.map((v) => ({ ...v, sku: `${v.sku}-${suffix}` }));
      // Sửa lỗi lệch giá trị option khi SPU có nhiều dòng cùng giá trị đặc tả (ví dụ "1 pc","1 pc").
      const uniqueValues = [...new Set(payload.variants.map((v) => v.options[options[0].title]))];
      payload.options = [{ title: options[0].title, values: uniqueValues }];
      try {
        await api(token, "/admin/products", { method: "POST", body: JSON.stringify(payload) });
        ok++;
        console.log("created (retry):", title);
      } catch (err2) {
        failed++;
        console.error("FAILED:", title, "-", err2.message.slice(0, 300));
      }
    }
  }

  console.log(`\nDone. Created ${ok}, failed ${failed}, total SPU ${bySpu.size}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
