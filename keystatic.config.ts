import { config, collection, fields } from "@keystatic/core";

/**
 * Keystatic ghi thẳng vào file markdown trong repo — không database,
 * không phí hạ tầng. Người bán vào /keystatic, thêm sản phẩm, bấm lưu;
 * Keystatic tạo commit, Cloudflare Pages tự build lại.
 *
 * storage: 'local' để chạy `npm run dev` trên máy bạn.
 * Đổi sang 'github' khi muốn người bán tự vào từ trình duyệt:
 *   storage: { kind: 'github', repo: 'your-user/your-repo' }
 */
export default config({
  storage: { kind: "local" },

  ui: {
    brand: { name: "Kotori — Quản lý sản phẩm" },
    navigation: {
      "Sản phẩm": ["products"],
    },
  },

  collections: {
    products: collection({
      label: "Sản phẩm",
      slugField: "name",
      path: "src/data/products/*",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["name", "brand", "price"],

      schema: {
        name: fields.slug({
          name: {
            label: "Tên tiếng Việt",
            validation: { length: { min: 3 } },
          },
          slug: {
            label: "Đường dẫn (URL)",
            description:
              "Không dấu, cách nhau bằng gạch ngang. Đổi cái này là đổi URL, sẽ mất SEO đã có.",
          },
        }),

        nameJa: fields.text({
          label: "Tên tiếng Nhật",
          description: "In dọc ở mép ảnh sản phẩm. Để trống nếu không có.",
        }),
        brand: fields.text({
          label: "Thương hiệu",
          validation: { isRequired: true },
        }),
        brandJa: fields.text({ label: "Thương hiệu (tiếng Nhật)" }),

        category: fields.select({
          label: "Danh mục",
          options: [
            { label: "Dưỡng da", value: "duong-da" },
            { label: "Chống nắng", value: "chong-nang" },
            { label: "Tẩy trang", value: "tay-trang" },
            { label: "Trang điểm", value: "trang-diem" },
            { label: "Dưỡng thể", value: "duong-the" },
            { label: "Chăm sóc tóc", value: "cham-soc-toc" },
          ],
          defaultValue: "duong-da",
        }),

        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tag",
          itemLabel: (props) => props.value,
        }),

        price: fields.integer({
          label: "Giá (VND)",
          description: "Nhập số thuần: 285000, không dấu chấm.",
          validation: { isRequired: true, min: 1000 },
        }),
        priceCompare: fields.integer({
          label: "Giá gạch ngang (VND)",
          description: "Để trống nếu không giảm giá.",
        }),

        inStock: fields.checkbox({ label: "Còn hàng", defaultValue: true }),
        featured: fields.checkbox({
          label: "Hiện ở mục Bán chạy",
          defaultValue: false,
        }),

        // --- Dữ liệu nhãn ---
        volume: fields.text({
          label: "Dung tích",
          description: 'Ghi kèm đơn vị: "170ml", "70g", "60 viên".',
          validation: { isRequired: true },
        }),
        jan: fields.text({
          label: "Mã JAN (13 số)",
          description: "Đọc từ barcode trên vỏ hộp. Phải đúng 13 chữ số.",
          validation: { pattern: { regex: /^\d{13}$/, message: "Cần đúng 13 chữ số" } },
        }),
        lot: fields.text({ label: "Mã lô" }),
        congBo: fields.text({
          label: "Số phiếu công bố",
          description: "Số trên phiếu công bố sản phẩm mỹ phẩm.",
        }),
        madeIn: fields.text({ label: "Xuất xứ", defaultValue: "Nhật Bản" }),
        mfgDate: fields.date({ label: "Ngày sản xuất" }),
        expiryMonths: fields.integer({
          label: "Hạn dùng (tháng kể từ NSX)",
        }),

        // --- Nội dung ---
        shortDesc: fields.text({
          label: "Mô tả ngắn",
          description:
            "Tối đa 180 ký tự. Dùng làm meta description trên Google — viết cho người đọc, đừng nhồi từ khoá.",
          multiline: true,
          validation: { isRequired: true, length: { max: 180 } },
        }),
        skinTypes: fields.array(fields.text({ label: "Loại da" }), {
          label: "Phù hợp loại da",
          itemLabel: (props) => props.value,
        }),
        ingredients: fields.array(fields.text({ label: "Thành phần" }), {
          label: "Thành phần",
          description: "Nhập theo đúng thứ tự trên nhãn gốc.",
          itemLabel: (props) => props.value,
        }),
        howToUse: fields.text({ label: "Cách dùng", multiline: true }),

        // --- Ảnh ---
        cover: fields.image({
          label: "Ảnh chính",
          directory: "src/assets/products",
          publicPath: "../../assets/products/",
          validation: { isRequired: true },
        }),
        gallery: fields.array(
          fields.image({
            label: "Ảnh",
            directory: "src/assets/products",
            publicPath: "../../assets/products/",
          }),
          { label: "Ảnh phụ", itemLabel: (props) => props.value?.filename ?? "Ảnh" },
        ),

        order: fields.integer({ label: "Thứ tự hiển thị", defaultValue: 0 }),
        draft: fields.checkbox({
          label: "Bản nháp (không đăng)",
          defaultValue: false,
        }),
        updatedAt: fields.date({ label: "Cập nhật lần cuối" }),

        content: fields.markdoc({
          label: "Nội dung chi tiết",
          extension: "md",
        }),
      },
    }),
  },
});
