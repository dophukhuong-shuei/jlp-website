// Dịch title + description toàn bộ sản phẩm sang tiếng Việt làm mặc định.
// Giữ nguyên bản gốc (EN/JA) trong metadata để nút đổi ngôn ngữ (Google Translate widget)
// dịch lại đúng nghĩa (vì content gốc giờ THẬT là tiếng Việt).
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

async function translateToVi(text) {
  if (!text || !text.trim()) return { text: "", sourceLang: null };
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate failed ${res.status}`);
  const data = await res.json();
  const translated = data[0].map((chunk) => chunk[0]).join("");
  const sourceLang = data[2];
  return { text: translated, sourceLang };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const token = await login();
  console.log("logged in");

  const { products } = await api(
    token,
    "/admin/products?limit=1000&fields=id,title,description,metadata",
  );
  console.log(`total products: ${products.length}`);

  let done = 0;
  for (const p of products) {
    if (p.metadata?.vi_translated) {
      console.log("skip (already translated):", p.title);
      continue;
    }

    try {
      const [titleVi, descVi] = await Promise.all([
        translateToVi(p.title),
        translateToVi(p.description),
      ]);
      await sleep(300); // tránh bị rate-limit endpoint free

      const metadata = {
        ...p.metadata,
        vi_translated: true,
        title_original: p.title,
        title_original_lang: titleVi.sourceLang,
        description_original: p.description,
        description_original_lang: descVi.sourceLang,
      };

      await api(token, `/admin/products/${p.id}`, {
        method: "POST",
        body: JSON.stringify({
          title: titleVi.text || p.title,
          description: descVi.text || p.description,
          metadata,
        }),
      });

      done++;
      console.log(`[${done}/${products.length}]`, p.title, "->", titleVi.text);
    } catch (err) {
      console.error("FAILED:", p.title, "-", err.message.slice(0, 200));
      await sleep(1000);
    }
  }

  console.log(`\nDone. Translated ${done}/${products.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
