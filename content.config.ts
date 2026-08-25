import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

/**
 * Schema bám sát thứ khách mua mỹ phẩm Nhật ở VN thực sự tra cứu:
 * mã JAN, dung tích, nơi sản xuất, số phiếu công bố, thành phần.
 * Mọi field đây đều validate ở build time — sai là build fail, không deploy trang lỗi.
 */
const products = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/products" }),
  schema: ({ image }) =>
    z.object({
      // --- Định danh ---
      name: z.string().min(3), // Tên tiếng Việt, dùng cho H1 + SEO
      nameJa: z.string().optional(), // Tên gốc tiếng Nhật, in dọc trên card
      brand: z.string(),
      brandJa: z.string().optional(),

      // --- Phân loại ---
      category: z.enum([
        "duong-da",
        "chong-nang",
        "tay-trang",
        "trang-diem",
        "duong-the",
        "cham-soc-toc",
      ]),
      tags: z.array(z.string()).default([]),

      // --- Thương mại (chỉ hiển thị, không thanh toán) ---
      price: z.number().int().positive(), // VND, số nguyên. 385000 chứ không phải 385.000
      priceCompare: z.number().int().positive().optional(), // giá gạch ngang
      inStock: z.boolean().default(true),
      featured: z.boolean().default(false),

      // --- Dữ liệu nhãn: đây là phần tạo niềm tin ---
      volume: z.string(), // "150ml", "50g", "60 viên"
      jan: z
        .string()
        .regex(/^\d{13}$/, "Mã JAN phải đúng 13 chữ số")
        .optional(),
      lot: z.string().optional(), // mã lô trên vỏ hộp
      congBo: z.string().optional(), // số phiếu công bố sản phẩm mỹ phẩm
      madeIn: z.string().default("Nhật Bản"),
      mfgDate: z.coerce.date().optional(),
      expiryMonths: z.number().int().positive().optional(), // hạn dùng kể từ NSX

      // --- Nội dung ---
      shortDesc: z.string().max(180), // dùng cho meta description + card
      ingredients: z.array(z.string()).default([]),
      howToUse: z.string().optional(),
      skinTypes: z.array(z.string()).default([]),

      // --- Ảnh ---
      cover: image(), // Astro tối ưu + validate kích thước
      gallery: z.array(image()).default([]),

      // --- Meta ---
      order: z.number().int().default(0),
      draft: z.boolean().default(false),
      updatedAt: z.coerce.date().optional(),
    }),
});

/**
 * Danh mục để làm nav + trang /danh-muc/:slug. Dùng file() loader:
 * 1 file JSON duy nhất, không cần 6 file markdown rời rạc.
 */
const categories = defineCollection({
  loader: file("./src/data/categories.json"),
  schema: z.object({
    id: z.string(),
    label: z.string(),
    labelJa: z.string().optional(),
    blurb: z.string(),
    order: z.number().int().default(0),
  }),
});

export const collections = { products, categories };
