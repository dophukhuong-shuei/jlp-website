# Catalog mỹ phẩm Nhật — Astro 6

Website trưng bày sản phẩm, không thanh toán online. Đơn hàng chốt qua Zalo hoặc điện thoại.

Toàn bộ site build ra HTML tĩnh. Không database, không serverless function, không API runtime → hạ tầng thực tế chỉ còn tiền domain.

## Chạy lần đầu

```bash
npm install
npm run dev
```

- Site: http://localhost:4321
- Trang quản lý sản phẩm: http://localhost:4321/keystatic

Yêu cầu Node `^22.12.0 || ^24.0.0` — Astro 6 không chạy trên Node 20.

## Việc cần làm trước khi deploy

| File | Sửa gì |
|---|---|
| `src/lib/site.ts` | Tên shop, Zalo OA, số điện thoại, địa chỉ, email |
| `astro.config.mjs` | `SITE` → domain thật |
| `public/robots.txt` | URL sitemap |
| `src/data/products/*.md` | Xoá 6 sản phẩm mẫu |
| `src/assets/products/*.jpg` | Xoá ảnh placeholder, thay ảnh thật |

**Số phiếu công bố trong dữ liệu mẫu là `PLACEHOLDER-...` — thay bằng số thật hoặc xoá field đó.** Đăng số công bố sai còn tệ hơn không đăng.

## Thêm sản phẩm

Hai cách, cùng ghi ra một chỗ:

**Bạn tự thêm** — tạo file `src/data/products/ten-san-pham.md`, copy frontmatter từ một file có sẵn. Schema ở `src/content.config.ts` validate ở build time: thiếu field bắt buộc hoặc mã JAN không đủ 13 số thì build fail ngay, không deploy được trang lỗi.

**Người bán tự thêm** — mở `keystatic.config.ts`, đổi:

```ts
storage: { kind: "local" }
// thành
storage: { kind: "github", repo: "your-user/your-repo" }
```

Sau đó người bán vào `/keystatic`, đăng nhập GitHub, điền form. Keystatic tạo commit → Cloudflare Pages tự build lại. Không cần biết Git.

Keystatic admin chỉ nạp khi `NODE_ENV=development` (xem `astro.config.mjs`), nên bản production không có route `/keystatic` và không phát sinh chi phí function.

## Deploy Cloudflare Pages

```
Framework preset:  Astro
Build command:     npm run build
Output directory:  dist
Node version:      22 (biến môi trường NODE_VERSION=22)
```

Nối repo GitHub → mỗi push tự deploy. Cloudflare Pages free tier cho phép dùng thương mại và không tính phí băng thông.

Đừng dùng Vercel Hobby cho site này — ToS của Vercel giới hạn Hobby ở mục đích phi thương mại.

## Kiến trúc

```
src/
├── content.config.ts        Schema sản phẩm (Zod 4). Nguồn chân lý duy nhất.
├── data/
│   ├── products/*.md        Mỗi sản phẩm 1 file markdown
│   └── categories.json      6 danh mục
├── assets/products/         Ảnh gốc — Astro tự sinh WebP/AVIF ở build time
├── lib/
│   ├── site.ts              Toàn bộ thông tin shop. Sửa duy nhất ở đây.
│   └── format.ts            Định dạng VND, deep link Zalo, tính hạn dùng
├── components/
│   ├── LabelStrip.astro     Dải nhãn JAN + dung tích + phiếu công bố
│   ├── ProductCard.astro
│   ├── ZaloCta.astro        Nút nổi Zalo/gọi
│   └── Seo.astro            Meta + JSON-LD
└── pages/
    ├── index.astro
    ├── danh-muc/[category].astro
    ├── san-pham/[...slug].astro
    └── sitemap.xml.ts       Tự sinh, không cần @astrojs/sitemap
```

## Ghi chú kỹ thuật

**Barcode trong `LabelStrip.astro` là biểu diễn thị giác, không quét được.** Nó suy ra từ chữ số JAN theo quy tắc cố định, không phải mã hoá EAN-13 hợp lệ. Nếu cần khách quét thật, cài `jsbarcode` và render SVG ở build time.

**Font.** Fraunces + Be Vietnam Pro + IBM Plex Mono, cả ba đều có bộ dấu tiếng Việt đầy đủ. Nếu đổi font display, kiểm tra `ề ữ ỡ ặ` trước — nhiều font display không có Vietnamese subset và sẽ fallback vỡ chữ.

**Ảnh.** Đặt ảnh gốc ≥1200px chiều rộng vào `src/assets/products/`. Astro sinh nhiều kích thước và định dạng modern lúc build. Đừng đặt vào `public/` — ảnh trong `public/` không được tối ưu.

**Giá.** Lưu dạng số nguyên VND (`285000`), format ở lúc render bằng `formatVnd()`. Không lưu chuỗi `"285.000đ"` — sẽ không sort và không đưa vào JSON-LD được.

**JSON-LD.** Mỗi trang sản phẩm có `Product` schema với `priceCurrency: "VND"` và `gtin13`. Google hiện giá trong kết quả tìm kiếm dù site không có checkout. `availability: InStock` nói về tình trạng hàng, không phải khả năng thanh toán — dùng vậy là hợp lệ.

## Chưa có, cân nhắc thêm sau

- Tìm kiếm client-side (Pagefind — chạy lúc build, không cần server)
- Trang so sánh giá/ml giữa các sản phẩm cùng loại
- Form "để lại số, shop gọi lại" (Cloudflare Worker + Web3Forms, đều có free tier)
- Trang tra cứu số phiếu công bố dẫn thẳng sang cổng Cục Quản lý Dược
