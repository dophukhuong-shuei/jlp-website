// Gắn metadata khuyến mãi/tặng kèm DEMO lên một phần sản phẩm để có dữ liệu test cho filter.
// Đây là placeholder — sửa/xoá lại trong Medusa Admin khi có khuyến mãi thật.
const BASE = "http://localhost:9000";

async function login() {
  const res = await fetch(`${BASE}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@jlb.local", password: "JlbAdmin123!" }),
  });
  return (await res.json()).token;
}

async function api(token, path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`${options.method || "GET"} ${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

const GIFTS = [
  "Tặng túi cotton mini JLP",
  "Tặng mẫu thử dòng dưỡng da",
  "Tặng voucher giảm 10% đơn kế tiếp",
];

async function main() {
  const token = await login();
  const { products } = await api(token, "/admin/products?limit=100&fields=id,title,metadata,*variants,*variants.prices");

  let onSale = 0;
  let withGift = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const price = p.variants?.[0]?.prices?.find((pr) => pr.currency_code === "vnd")?.amount;
    const metadata = { ...p.metadata };

    // ~20%: đặt original_price cao hơn giá hiện tại 15-30% -> hiển thị giảm giá
    if (price && i % 5 === 0) {
      const bump = 1.15 + ((i * 7) % 16) / 100; // 1.15 - 1.30
      metadata.original_price = Math.round((price * bump) / 1000) * 1000;
      onSale++;
    }
    // ~15%: gắn quà tặng kèm
    if (price && i % 7 === 0) {
      metadata.gift = GIFTS[i % GIFTS.length];
      withGift++;
    }

    if (metadata.original_price || metadata.gift) {
      await api(token, `/admin/products/${p.id}`, { method: "POST", body: JSON.stringify({ metadata }) });
      console.log("updated", p.title, metadata.original_price ? `[sale ${metadata.original_price}]` : "", metadata.gift ?? "");
    }
  }

  console.log(`\nDone. onSale=${onSale} withGift=${withGift} total=${products.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
