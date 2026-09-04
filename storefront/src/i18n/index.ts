export const locales = ["vi", "en", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

/** Thêm /en hoặc /ja trước path; vi (mặc định) không có prefix. */
export function localizePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  return locale === defaultLocale ? `/${clean}`.replace(/\/+/g, "/") : `/${locale}${clean}`.replace(/\/+/g, "/");
}

/** Bỏ prefix /en hoặc /ja khỏi 1 pathname hiện tại, trả về path "gốc" (dạng vi, không prefix). */
export function stripLocalePrefix(pathname: string): string {
  const m = pathname.match(/^\/(en|ja)(\/.*|$)/);
  return m ? m[2] || "/" : pathname;
}

type Dict = {
  hotline: string;
  deliveryNote: string;
  searchPlaceholder: string;
  searchEmpty: (q: string) => string;
  chatZalo: string;
  themeToggle: string;
  promotions: string;
  newArrivals: string;
  home: string;
  categories: string;
  about: string;
  faq: string;
  privacyPolicy: string;
  contact: string;
  address: string;
  categoriesLabel: string;
  aboutGoods: string;
  aboutGoodsBody: string;
  aboutGoodsLink: string;
  footerCopyright: (year: number) => string;
  footerShowcaseNote: string;
  responsePromise: string;
  callBtn: (phone: string) => string;
  notFoundTitle: string;
  notFoundBody: string;
  backHome: string;
  catalogTagline: string;
  shopAll: string;
  beautyTipsTitle: string;
  beautyTipsEyebrow: string;
};

const vi: Dict = {
  hotline: "Hotline",
  deliveryNote: "Giao 1–2 ngày nội thành · Đổi hàng lỗi trong 7 ngày",
  searchPlaceholder: "Tìm sản phẩm...",
  searchEmpty: (q) => `Không tìm thấy "${q}".`,
  chatZalo: "Chat Zalo",
  themeToggle: "Chuyển giao diện sáng/tối",
  promotions: "Khuyến mãi",
  newArrivals: "Hàng mới",
  home: "Trang chủ",
  categories: "Danh mục",
  about: "Giới thiệu",
  faq: "Câu hỏi thường gặp",
  privacyPolicy: "Chính sách bảo mật",
  contact: "Liên hệ",
  address: "Địa chỉ",
  categoriesLabel: "Danh mục",
  aboutGoods: "Về hàng hoá",
  aboutGoodsBody:
    "Mọi sản phẩm đều hiển thị mã JAN và số phiếu công bố sản phẩm mỹ phẩm. Bạn có thể quét mã vạch hoặc tra số công bố trên cổng thông tin của Cục Quản lý Dược để tự đối chiếu trước khi đặt.",
  aboutGoodsLink: "Xem trang giới thiệu →",
  footerCopyright: (year) => `© ${year}`,
  footerShowcaseNote: "Website trưng bày sản phẩm — đặt hàng qua Zalo hoặc điện thoại",
  responsePromise: "Phản hồi trong ~15 phút giờ hành chính",
  callBtn: (phone) => phone,
  notFoundTitle: "Không tìm thấy trang này",
  notFoundBody: "Trang bạn đang tìm có thể đã bị xoá hoặc đổi địa chỉ. Hãy thử tìm sản phẩm hoặc quay lại trang chủ.",
  backHome: "Về trang chủ",
  catalogTagline: "Catalog mỹ phẩm Nhật",
  shopAll: "Xem catalog",
  beautyTipsTitle: "Hướng dẫn làm đẹp",
  beautyTipsEyebrow: "Mẹo chăm sóc da",
};

const en: Dict = {
  hotline: "Hotline",
  deliveryNote: "1–2 day delivery in the city · Defective items exchanged within 7 days",
  searchPlaceholder: "Search products...",
  searchEmpty: (q) => `No results for "${q}".`,
  chatZalo: "Chat on Zalo",
  themeToggle: "Toggle light/dark mode",
  promotions: "Promotions",
  newArrivals: "New arrivals",
  home: "Home",
  categories: "Categories",
  about: "About",
  faq: "FAQ",
  privacyPolicy: "Privacy policy",
  contact: "Contact",
  address: "Address",
  categoriesLabel: "Categories",
  aboutGoods: "About our products",
  aboutGoodsBody:
    "Every product shows its JAN code and cosmetic-license number. Scan the barcode or look up the license number on the Drug Administration's portal to verify it yourself before ordering.",
  aboutGoodsLink: "See the about page →",
  footerCopyright: (year) => `© ${year}`,
  footerShowcaseNote: "This site only showcases products — order via Zalo or phone",
  responsePromise: "We reply within ~15 minutes during business hours",
  callBtn: (phone) => phone,
  notFoundTitle: "Page not found",
  notFoundBody: "The page you're looking for may have been removed or moved. Try searching for a product or go back home.",
  backHome: "Back home",
  catalogTagline: "Japanese cosmetics catalog",
  shopAll: "Browse catalog",
  beautyTipsTitle: "Beauty tutorials",
  beautyTipsEyebrow: "Skincare tips",
};

const ja: Dict = {
  hotline: "ホットライン",
  deliveryNote: "市内1〜2日でお届け・不良品は7日以内に交換",
  searchPlaceholder: "商品を検索...",
  searchEmpty: (q) => `"${q}" に一致する商品はありません。`,
  chatZalo: "Zaloでチャット",
  themeToggle: "ライト/ダークモード切替",
  promotions: "キャンペーン",
  newArrivals: "新着商品",
  home: "ホーム",
  categories: "カテゴリー",
  about: "会社概要",
  faq: "よくある質問",
  privacyPolicy: "プライバシーポリシー",
  contact: "お問い合わせ",
  address: "住所",
  categoriesLabel: "カテゴリー",
  aboutGoods: "商品について",
  aboutGoodsBody:
    "すべての商品にJANコードと化粧品届出番号を表示しています。注文前にバーコードや届出番号を薬務管理局のポータルでご自身で確認いただけます。",
  aboutGoodsLink: "会社概要ページを見る →",
  footerCopyright: (year) => `© ${year}`,
  footerShowcaseNote: "本サイトは商品展示のみ — ご注文はZaloまたはお電話で",
  responsePromise: "営業時間内は約15分以内に返信します",
  callBtn: (phone) => phone,
  notFoundTitle: "ページが見つかりません",
  notFoundBody: "お探しのページは削除または移動された可能性があります。商品を検索するかホームに戻ってください。",
  backHome: "ホームに戻る",
  catalogTagline: "日本製化粧品カタログ",
  shopAll: "カタログを見る",
  beautyTipsTitle: "美容チュートリアル",
  beautyTipsEyebrow: "スキンケアのコツ",
};

const dictionaries: Record<Locale, Dict> = { vi, en, ja };

export function t(locale: Locale): Dict {
  return dictionaries[locale];
}

/** 6 danh mục cố định (theo CATEGORY_MAP backend) — dịch tĩnh vì tên danh mục Medusa luôn là tiếng Việt. */
const CATEGORY_NAME_TRANSLATIONS: Record<string, { en: string; ja: string }> = {
  "Dưỡng da": { en: "Skincare", ja: "スキンケア" },
  "Chống nắng": { en: "Sun care", ja: "日焼け止め" },
  "Tẩy trang": { en: "Makeup remover", ja: "クレンジング" },
  "Trang điểm": { en: "Makeup", ja: "メイクアップ" },
  "Dưỡng thể": { en: "Body care", ja: "ボディケア" },
  "Chăm sóc tóc": { en: "Hair care", ja: "ヘアケア" },
};

export function translateCategoryName(viName: string, locale: Locale): string {
  if (locale === "vi") return viName;
  return CATEGORY_NAME_TRANSLATIONS[viName]?.[locale] ?? viName;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Dưỡng da": "🧴",
  "Chống nắng": "☀️",
  "Tẩy trang": "🧼",
  "Trang điểm": "💄",
  "Dưỡng thể": "🧖",
  "Chăm sóc tóc": "💇",
};

export function categoryIcon(viName: string): string {
  return CATEGORY_ICONS[viName] ?? "🏷️";
}
