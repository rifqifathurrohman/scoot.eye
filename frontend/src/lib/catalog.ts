export interface Product {
  id: string;
  name: string;
  price: number;
  colors: string[];
  description: string;
  images: string[];
  collection: string;
  index: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  color: string;
  price: number;
  quantity: number;
  customPrint: boolean;
  customText: string;
  fileName: string;
  note: string;
}

export const CUSTOM_PRINT_PRICE = 15000;
export const WHATSAPP_NUMBER = "6285156581959";
const REFERENCE_ASSET = "https://ftreyewear-fas8dpd2.manus.space";

const gallery = (slug: string, files: number[]) =>
  files.map((file) => `${REFERENCE_ASSET}/assets/products/${slug}/${slug}-${String(file).padStart(2, "0")}.webp`);

export const products: Product[] = [
  {
    id: "brill",
    name: "Brill",
    price: 100000,
    colors: ["Hitam"],
    description: "Kacamata Brill untuk melengkapi gaya harian dengan pilihan warna seperti yang terlihat pada galeri foto.",
    images: gallery("brill", [1, 2, 3, 4, 5]),
    collection: "SCOOT ORIGINALS",
    index: "01",
  },
  {
    id: "ocala",
    name: "Ocala",
    price: 100000,
    colors: ["Putih/Krem"],
    description: "Koleksi Ocala menampilkan pilihan tampilan warna yang dapat dilihat langsung pada galeri produk.",
    images: gallery("ocala", [1, 2, 3, 4, 5, 7, 8, 9]),
    collection: "SCOOT ORIGINALS",
    index: "02",
  },
  {
    id: "casama",
    name: "Casama",
    price: 110000,
    colors: ["Hitam"],
    description: "Casama hadir sebagai model dengan harga khusus koleksi. Lihat variasi warna dan tampilan pada foto produk.",
    images: gallery("casama", [1, 2, 3, 4, 5, 6, 7, 8]),
    collection: "SCOOT ORIGINALS",
    index: "03",
  },
  {
    id: "brazz",
    name: "Brazz",
    price: 100000,
    colors: ["Hitam"],
    description: "Temukan tampilan Brazz melalui foto-foto koleksi dan pilih opsi polos atau custom print.",
    images: gallery("brazz", [1, 2, 3, 4, 6, 7, 8, 9, 10]),
    collection: "SCOOT ORIGINALS",
    index: "04",
  },
  {
    id: "duble",
    name: "Duble",
    price: 100000,
    colors: ["Hitam"],
    description: "Koleksi Duble menampilkan beberapa pilihan tampilan warna sebagaimana terlihat pada galeri produk.",
    images: gallery("duble", Array.from({ length: 12 }, (_, i) => i + 1)),
    collection: "SCOOT ORIGINALS",
    index: "05",
  },
  {
    id: "kurera",
    name: "Kurera",
    price: 100000,
    colors: ["Hitam"],
    description: "Kurera memberi pilihan gaya personal yang dapat dilihat melalui foto-foto produk yang tersedia.",
    images: gallery("kurera", Array.from({ length: 9 }, (_, i) => i + 1)),
    collection: "SCOOT ORIGINALS",
    index: "06",
  },
  {
    id: "tropic",
    name: "Tropic",
    price: 100000,
    colors: ["Hitam"],
    description: "Jelajahi koleksi Tropic dan pilihan warna yang ditampilkan pada foto produk.",
    images: gallery("tropic", Array.from({ length: 11 }, (_, i) => i + 1)),
    collection: "SCOOT ORIGINALS",
    index: "07",
  },
  {
    id: "satvale",
    name: "Satvale",
    price: 100000,
    colors: ["Biru"],
    description: "Lihat tampilan Satvale melalui galeri foto, lalu pilih produk polos atau tambahkan custom print.",
    images: gallery("satvale", Array.from({ length: 7 }, (_, i) => i + 1)),
    collection: "SCOOT ORIGINALS",
    index: "08",
  },
  {
    id: "fourty",
    name: "Fourty",
    price: 100000,
    colors: ["Hitam"],
    description: "Fourty tersedia dengan pilihan tampilan seperti yang terlihat pada galeri foto produk.",
    images: gallery("fourty", Array.from({ length: 7 }, (_, i) => i + 1)),
    collection: "SCOOT ORIGINALS",
    index: "09",
  },
];

export const campaignImages = [
  `${REFERENCE_ASSET}/manus-storage/campaign-maroon_2b77d7cf.webp`,
  `${REFERENCE_ASSET}/manus-storage/campaign-red-frame_ae537b5b.webp`,
  `${REFERENCE_ASSET}/manus-storage/campaign-neon_3b036a8c.webp`,
];

export const galleryImages = [
  { src: `${REFERENCE_ASSET}/assets/products/ocala/ocala-07.webp`, label: "01 / OCALA" },
  { src: `${REFERENCE_ASSET}/assets/products/brazz/brazz-05.webp`, label: "02 / BRAZZ" },
  { src: `${REFERENCE_ASSET}/assets/products/tropic/tropic-06.webp`, label: "03 / TROPIC" },
];

export const formatPrice = (price: number) => `Rp${new Intl.NumberFormat("id-ID").format(price)}`;

export const productById = (id: string | undefined) => products.find((product) => product.id === id);