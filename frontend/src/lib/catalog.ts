export interface ProductVariant {
  code: string;
  color: string;
  stock: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  /** Regular price per pair. */
  price: number;
  /** Opening-promo price, valid until OPENING_PROMO_END. */
  openingPrice?: number;
  colors: string[];
  variants: ProductVariant[];
  description: string;
  images: string[];
  collection: string;
  index: string;
  /** Item id of this model's Shopee listing, once it is live there. */
  shopeeItemId?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  color: string;
  variantCode?: string;
  stock?: number;
  price: number;
  quantity: number;
  customPrint: boolean;
  customText: string;
  fileName: string;
  note: string;
}

export const CUSTOM_PRINT_PRICE = 15000;
// Opening promo: openingPrice applies until the end of Sunday 29 Nov 2026 (WIB), then the regular price.
// Built-in defaults; the backoffice (Supabase settings.opening_promo) can override both at runtime.
export let OPENING_PROMO_END = new Date("2026-11-29T23:59:59+07:00");
export let OPENING_PROMO_LABEL = "s/d 29 Nov";
export const setOpeningPromo = (end: Date, label: string) => {
  if (!Number.isNaN(end.getTime())) OPENING_PROMO_END = end;
  if (label.trim()) OPENING_PROMO_LABEL = label.trim();
};
export const isOpeningPromo = (at: Date = new Date()) => at.getTime() <= OPENING_PROMO_END.getTime();
/** Price a customer pays right now (opening price while the promo runs). */
export const priceOf = (product: Pick<Product, "price" | "openingPrice">, at: Date = new Date()) =>
  isOpeningPromo(at) && product.openingPrice ? product.openingPrice : product.price;
/** True when the product currently shows a struck-through regular price. */
export const isDiscounted = (product: Pick<Product, "price" | "openingPrice">, at: Date = new Date()) =>
  priceOf(product, at) < product.price;
export const WHATSAPP_NUMBER = "6285156581959";
export const SHOPEE_SHOP_ID = "71768025";
export const SHOPEE_STORE_URL = `https://shopee.co.id/shop/${SHOPEE_SHOP_ID}`;
export const TOKOPEDIA_STORE_URL = "https://www.tokopedia.com/scooteyewear";
/** Link to the model's Shopee listing, or to the whole store while it is not listed yet. */
export const shopeeUrl = (product?: Pick<Product, "shopeeItemId">) =>
  product?.shopeeItemId ? `https://shopee.co.id/product/${SHOPEE_SHOP_ID}/${product.shopeeItemId}` : SHOPEE_STORE_URL;

// Originals live in public/Belisima series; scripts/normalize_products.py writes trimmed,
// centred 1000×1000 copies to public/catalog so every frame shows at the same scale.
const slug = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const image = (folder: string, file: string) => `/catalog/${slug(folder)}/${slug(file)}.webp`;

const colorNames: Record<string, string> = {
  BB: "Hitam", BL: "Hitam", BR: "Cokelat", BG: "Hijau Gelap",
  BO: "Hitam/Oranye", COBI: "Cokelat", GI: "Cokelat", LD: "Cokelat Muda",
  WD: "Cokelat Kayu", TI: "Cokelat", TP: "Cokelat", PK: "Pink",
  LB: "Hitam", LG: "Cokelat", LT: "Cokelat", BC: "Cokelat",
  BP: "Hitam/Pink", LC: "Cokelat Muda", PC: "Pink Cokelat", PP: "Pink Muda",
  RB: "Merah Cokelat", RC: "Merah Cokelat", TC: "Tortoise Cokelat",
  BY: "Hitam/Kuning", GG: "Hijau", OR: "Oranye", WH: "Putih",
  HW: "Hitam", ST: "Kuning", CL: "Putih", TB: "Putih",
  TG: "Tortoise Hijau", TT: "Tortoise", GR: "Hijau",
};

const variant = (
  code: string,
  stock: number,
  folder: string,
  file: string,
  colorName?: string,
): ProductVariant => ({
  code,
  color: colorName ?? colorNames[code] ?? code,
  stock,
  image: image(folder, file),
});

export const getProductStock = (product: Product) =>
  product.variants.reduce((total, item) => total + item.stock, 0);

export const getAvailableVariants = (product: Product) =>
  product.variants.filter((item) => item.stock > 0);

export const getVariantByCode = (product: Product, code: string) =>
  product.variants.find((item) => item.code === code);

export const products: Product[] = [
  {
    id: "brill", name: "Brill", price: 120000, openingPrice: 100000,
    colors: ["BL", "LD", "PK", "TI", "TP"],
    variants: [
      variant("BL", 34, "A _ Brill", "BRILL BL.JPG", "Hitam"),
      variant("LD", 16, "A _ Brill", "BRILL LD.JPG", "Leopard"),
      variant("PK", 20, "A _ Brill", "BRILL PK.JPG", "Pink"),
      variant("TI", 25, "A _ Brill", "BRILL TI.JPG", "Cokelat"),
      variant("TP", 7, "A _ Brill", "BRILL TP.JPG", "Putih"),
    ],
    description: "Model Brill dari Belisima Series.",
    images: [image("A _ Brill", "BRILL BL.JPG")], collection: "BELISIMA SERIES", index: "01", shopeeItemId: "49371928958",
  },
  {
    id: "ocala", name: "Ocala", price: 120000, openingPrice: 100000,
    colors: ["BB", "BG", "BL", "BR", "COBI", "GI", "LD", "TI", "WD"],
    variants: [
      variant("BB", 22, "B _ Ocala", "OCALA BB.JPG"), variant("BG", 0, "B _ Ocala", "OCALA BG.JPG"),
      variant("BL", 4, "B _ Ocala", "OCALA BL.JPG"), variant("BR", 0, "B _ Ocala", "OCALA BR.JPG"),
      variant("COBI", 0, "B _ Ocala", "OCALA COBI.jpeg"), variant("GI", 20, "B _ Ocala", "OCALA  GI.JPG"),
      variant("LD", 28, "B _ Ocala", "OCALA LD.JPG", "Leopard"), variant("TI", 0, "B _ Ocala", "OCALA TI.JPG"),
      variant("WD", 22, "B _ Ocala", "OCALA WD.JPG"),
    ],
    description: "Model Ocala dari Belisima Series.",
    images: [image("B _ Ocala", "OCALA BB.JPG")], collection: "BELISIMA SERIES", index: "02", shopeeItemId: "54621826127",
  },
  {
    id: "casama", name: "Casama", price: 130000, openingPrice: 110000,
    colors: ["BL", "BR", "LB", "LD", "LG", "LT", "TI"],
    variants: [
      variant("BL", 0, "C _ casama", "CASAMA BL .JPG"),
      variant("BR", 19, "C _ casama", "CASAMA BR.JPG", "Hitam — Kaca Kuning"),
      variant("LB", 39, "C _ casama", "CASAMA LB.JPG"),
      variant("LD", 4, "C _ casama", "CASAMA LD.JPG", "Leopard"),
      variant("LG", 68, "C _ casama", "CASAMA LG.JPG", "Leopard"),
      variant("LT", 0, "C _ casama", "CASAMA LT.JPG"),
      variant("TI", 20, "C _ casama", "CASAMA TI.JPG"),
    ],
    description: "Model Casama dari Belisima Series.",
    images: [image("C _ casama", "CASAMA BL .JPG")], collection: "BELISIMA SERIES", index: "03", shopeeItemId: "50471893262",
  },
  {
    id: "brazz", name: "Brazz", price: 130000, openingPrice: 100000,
    colors: ["BB", "BL", "BO", "BR", "GR", "LB", "LD", "TG", "TP"],
    variants: [
      variant("BB", 0, "D _ Brazz", "Brazz BB.JPG"), variant("BL", 16, "D _ Brazz", "Brazz BL.JPG"),
      variant("BO", 0, "D _ Brazz", "Brazz BO.JPG"), variant("BR", 39, "D _ Brazz", "Brazz BR.JPG"),
      variant("GR", 0, "D _ Brazz", "Brazz GR.JPG"), variant("LB", 0, "D _ Brazz", "Brazz LB.JPG"),
      variant("LD", 36, "D _ Brazz", "Brazz LD.JPG", "Leopard"), variant("TG", 0, "D _ Brazz", "Brazz TG.JPG"),
      variant("TP", 0, "D _ Brazz", "Brazz TP.JPG"),
    ],
    description: "Model Brazz dari Belisima Series.",
    images: [image("D _ Brazz", "Brazz BB.JPG")], collection: "BELISIMA SERIES", index: "04", shopeeItemId: "40186896908",
  },
  {
    id: "duble", name: "Duble", price: 120000, openingPrice: 100000,
    colors: ["BC", "BL", "BP", "BR", "LB", "LC", "PC", "PP", "RB", "RC", "TC", "TI"],
    variants: [
      variant("BC", 0, "E _ duble", "DUBLE BC.JPG"), variant("BL", 79, "E _ duble", "DUBLE BL.JPG", "Hitam"),
      variant("BP", 23, "E _ duble", "DUBLE BP.JPG", "Hitam — Kaca Jernih"), variant("BR", 39, "E _ duble", "DUBLE BR.JPG"),
      variant("LB", 26, "E _ duble", "DUBLE LB.JPG", "Leopard"), variant("LC", 0, "E _ duble", "DUBLE LC.JPG"),
      variant("PC", 0, "E _ duble", "DUBLE PC.JPG"), variant("PP", 30, "E _ duble", "DUBLE PP.JPG"),
      variant("RB", 0, "E _ duble", "DUBLE RB.JPG"), variant("RC", 0, "E _ duble", "DUBLE RC.JPG"),
      variant("TC", 23, "E _ duble", "DUBLE TC.JPG"), variant("TI", 0, "E _ duble", "DUBLE TI.JPG"),
    ],
    description: "Model Duble dari Belisima Series.",
    images: [image("E _ duble", "DUBLE BL.JPG")], collection: "BELISIMA SERIES", index: "05", shopeeItemId: "50221861741",
  },
  {
    id: "kurera", name: "Kurera", price: 130000, openingPrice: 100000,
    colors: ["BB", "BG", "BL", "BR", "BY", "GG", "OR", "TP", "WH"],
    variants: [
      variant("BB", 0, "F _ kurera", "KUKERA BB.JPG"), variant("BG", 32, "F _ kurera", "KUKERA BG.JPG"),
      variant("BL", 47, "F _ kurera", "KUKERA BL.JPG"),
      variant("BR", 48, "F _ kurera", "KUKERA BR.JPG", "Merah"),
      variant("BY", 0, "F _ kurera", "KUKERA BY.JPG"), variant("GG", 0, "F _ kurera", "KUKERA GG.JPG"),
      variant("OR", 0, "F _ kurera", "KUKERA OR.JPG"), variant("TP", 0, "F _ kurera", "KUKERA TP.JPG"),
      variant("WH", 0, "F _ kurera", "KUKERA WH.JPG"),
    ],
    description: "Model Kurera dari Belisima Series.",
    images: [image("F _ kurera", "KUKERA BL.JPG")], collection: "BELISIMA SERIES", index: "06", shopeeItemId: "55071876623",
  },
  {
    id: "tropic", name: "Tropic", price: 140000, openingPrice: 100000,
    colors: ["BB", "BL", "BP", "BR", "BY", "HW", "LD", "PK", "WH"],
    variants: [
      variant("BB", 0, "G _ tropic", "TROPIC BB.jpeg"), variant("BL", 0, "G _ tropic", "TROPIC BL.JPG"),
      variant("BP", 0, "G _ tropic", "TROPIC BP.JPG"), variant("BR", 14, "G _ tropic", "TROPIC BR.jpeg"),
      variant("BY", 0, "G _ tropic", "TROPIC BY.JPG"), variant("HW", 0, "G _ tropic", "TROPIC HW.JPG"),
      variant("LD", 0, "G _ tropic", "TROPIC LD.JPG"), variant("PK", 0, "G _ tropic", "TROPIC PK.JPG"),
      variant("WH", 0, "G _ tropic", "TROPIC WH.JPG"),
    ],
    description: "Model Tropic dari Belisima Series.",
    images: [image("G _ tropic", "TROPIC BL.JPG")], collection: "BELISIMA SERIES", index: "07", shopeeItemId: "45721933613",
  },
  {
    id: "satvale", name: "Satvale", price: 140000, openingPrice: 100000,
    colors: ["BB", "BG", "BL", "LD", "ST", "TI", "WH"],
    variants: [
      variant("BB", 29, "H _ SATVALE", "SATVALE BB.JPG", "Biru"),
      variant("BG", 0, "H _ SATVALE", "SATVALE BG.JPG"),
      variant("BL", 20, "H _ SATVALE", "SATVALE BL.JPG", "Hitam"),
      variant("LD", 0, "H _ SATVALE", "SATVALE LD.JPG"),
      variant("ST", 15, "H _ SATVALE", "SATVALE ST.JPG"),
      variant("TI", 0, "H _ SATVALE", "SATVALE TI.JPG"),
      variant("WH", 20, "H _ SATVALE", "SATVALE WH.JPG"),
    ],
    description: "Model Satvale dari Belisima Series.",
    images: [image("H _ SATVALE", "SATVALE BB.JPG")], collection: "BELISIMA SERIES", index: "08", shopeeItemId: "55371898652",
  },
  {
    id: "fourty", name: "Fourty", price: 120000, openingPrice: 100000,
    colors: ["BL", "CL", "LD", "TB", "TG", "TP", "TT"],
    variants: [
      variant("BL", 35, "I _ FOURTY", "FOURTY BL.JPG"), variant("CL", 25, "I _ FOURTY", "FOURTY CL.JPG"),
      variant("LD", 0, "I _ FOURTY", "FOURTY LD.JPG"), variant("TB", 28, "I _ FOURTY", "FOURTY TB.JPG"),
      variant("TG", 0, "I _ FOURTY", "FOURTY TG.JPG"), variant("TP", 0, "I _ FOURTY", "FOURTY TP.JPG"),
      variant("TT", 0, "I _ FOURTY", "FOURTY TT.JPG"),
    ],
    description: "Model Fourty dari Belisima Series.",
    images: [image("I _ FOURTY", "FOURTY BL.JPG")], collection: "BELISIMA SERIES", index: "09", shopeeItemId: "40536876030",
  },
];

export const campaignImages = [
  "/images/campaign-maroon.webp",
  "/images/campaign-red-frame.webp",
  "/images/campaign-neon.webp",
];

export const galleryImages = [
  { src: image("B _ Ocala", "OCALA LD.JPG"), label: "01 / OCALA" },
  { src: image("D _ Brazz", "Brazz LD.JPG"), label: "02 / BRAZZ" },
  { src: image("G _ tropic", "TROPIC BR.jpeg"), label: "03 / TROPIC" },
];

export const formatPrice = (price: number) => `Rp${new Intl.NumberFormat("id-ID").format(price)}`;
export const productById = (id: string | undefined) => products.find((product) => product.id === id);

// Always build wa.me links through here so free text (names, addresses, "&", "#") is encoded.
export const whatsappUrl = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

// Older cart entries stored the variant code (e.g. "BL") as the color; resolve it to a readable name.
export const cartItemColor = (item: Pick<CartItem, "productId" | "variantCode" | "color">) => {
  const product = productById(item.productId);
  const variantItem = product && item.variantCode ? getVariantByCode(product, item.variantCode) : undefined;
  return variantItem?.color ?? item.color;
};
export const getDominantFrameColor = (colorName: string) => {
  const name = colorName.toLowerCase();
  if (name.includes("cokelat")) return "Cokelat";
  if (name.includes("biru")) return "Biru";
  if (name.includes("hijau")) return "Hijau";
  if (name.includes("pink")) return "Pink";
  if (name.includes("oranye") || name.includes("orange")) return "Oranye";
  if (name.includes("merah")) return "Merah";
  if (name.includes("putih") || name.includes("cream") || name.includes("krem")) return "Putih/Krem";
  if (name.includes("tortoise") || name.includes("smoke") || name.includes("abu") || name.includes("abu-abu")) return name.includes("tortoise") ? "Tortoise" : "Abu-abu/Smoke";
  if (name.includes("hitam") || name.includes("black")) return "Hitam";
  return colorName;
};