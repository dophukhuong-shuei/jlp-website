export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(amount))}₫`;
}

/** VND lưu dạng số nguyên (285000). Các currency khác (dữ liệu demo Medusa) dùng Intl chuẩn. */
export function formatPrice(amount: number, currency: string): string {
  if (currency.toLowerCase() === "vnd") return formatVnd(amount);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: currency.toUpperCase() }).format(amount);
}

/**
 * Hộp sản phẩm giữ chỗ khi chưa có ảnh thật, cùng ngôn ngữ hình với preview.html gốc.
 */
export function boxSvg(bg: string): string {
  let lines = "";
  let i = 0;
  for (let y = 360; y < 700; y += 34, i++) {
    const w = i % 3 ? 180 : 120;
    lines += `<rect x="290" y="${y}" width="${w}" height="7" fill="#c8cdd4"/>`;
  }
  let bars = "";
  let x = 300;
  for (let j = 0; j < 26; j++) {
    const bw = 2 + ((j * 7) % 5);
    bars += `<rect x="${x}" y="712" width="${bw}" height="46" fill="#14213a"/>`;
    x += bw + 3;
  }
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="1000" fill="${bg}"/><rect x="250" y="220" width="300" height="560" fill="#fff" stroke="#14213a" stroke-width="3"/><rect x="250" y="220" width="300" height="80" fill="#14213a"/>${lines}${bars}</svg>`;
}

/** Biểu diễn thị giác từ mã JAN — không phải mã hoá EAN-13 quét được thật. */
export function barcode(jan: string): string {
  return jan
    .split("")
    .flatMap((d) => {
      const n = Number(d);
      return [
        `<span class="bar" style="width:${1 + (n % 3)}px;background:var(--ink)"></span>`,
        `<span class="bar" style="width:${1 + ((n + 1) % 2)}px"></span>`,
      ];
    })
    .join("");
}

const PLACEHOLDER_BG = ["#e9eef0", "#e2ecf1", "#f4eeef", "#ebebf0", "#f0f3ec", "#f5f0e9"];

export function placeholderBg(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PLACEHOLDER_BG[hash % PLACEHOLDER_BG.length];
}
