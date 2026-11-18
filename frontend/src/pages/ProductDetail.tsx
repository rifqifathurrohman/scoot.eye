import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { addCartItem } from "@/lib/cart";
import { readCustomDraft } from "@/lib/customDraft";
import {
  CUSTOM_PRINT_PRICE,
  formatPrice,
  getAvailableVariants,
  getVariantByCode,
  productById,
  whatsappUrl,
} from "@/lib/catalog";

export default function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const product = productById(id);
  const fotoParam = Number(searchParams.get("foto") ?? 1);
  const initialColorFor = (target: typeof product) => {
    if (!target) return "";
    const available = getAvailableVariants(target);
    const fromPhoto = available[Math.max(0, fotoParam - 1)];
    return fromPhoto?.code ?? available[0]?.code ?? target.colors[0] ?? "";
  };
  const customMode = searchParams.get("custom") === "1";
  // Design started in the "Make it yours" temple preview, if any.
  const [draft] = useState(() => (customMode ? readCustomDraft() : null));
  const [customPrint, setCustomPrint] = useState(customMode);
  const [customText, setCustomText] = useState(draft?.text ?? "");
  const [fileName, setFileName] = useState(draft?.fileName ?? "");
  const [note, setNote] = useState(
    draft ? `Gaya huruf: ${draft.fontLabel}. Warna grafir: ${draft.finishLabel}.` : "",
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(() => initialColorFor(product));
  useEffect(() => {
    setSelectedColor(initialColorFor(product));
    setQuantity(1);
    // Reset only when navigating to a different product.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (!product)
    return (
      <div className="bg-[#f9f9f7] text-black" data-testid="product-not-found">
        <SiteHeader />
        <main className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8102e]">
            404 · Produk
          </p>
          <h1 className="mt-5 font-heading text-5xl font-bold uppercase leading-[0.85] tracking-[-0.08em] sm:text-8xl">
            Model tidak
            <br />
            ditemukan.
          </h1>
          <p className="mt-6 max-w-md text-base text-[#666]">
            Model ini mungkin sudah tidak tersedia atau tautannya salah.
          </p>
          <Link
            to="/katalog/"
            className="mt-8 inline-flex items-center gap-3 bg-black px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c8102e]"
            data-testid="product-not-found-link"
          >
            <ArrowLeft size={14} /> Kembali ke katalog
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  const selectedVariant = getVariantByCode(product, selectedColor);
  const selectedStock = selectedVariant?.stock ?? 0;
  const colorName = selectedVariant?.color ?? selectedColor;
  const quantityAtLimit = quantity >= selectedStock;
  const unitPrice = product.price + (customPrint ? CUSTOM_PRINT_PRICE : 0);
  const whatsappText = `Halo SCOOT EYEWEAR, saya ingin bertanya tentang ${product.name} warna ${colorName} (kode ${selectedColor}). Jumlah: ${quantity} pcs. Pilihan: ${customPrint ? "custom print" : "polos"}. Harga satuan: ${formatPrice(unitPrice)}.`;
  const selectVariant = (code: string) => {
    setSelectedColor(code);
    const stock = getVariantByCode(product, code)?.stock ?? 0;
    setQuantity((value) => Math.max(1, Math.min(value, stock)));
  };
  const addItem = () => {
    if (selectedStock <= 0) {
      toast.error("Produk sedang habis", {
        description: `Varian ${selectedColor} berstatus out of stock.`,
      });
      return;
    }
    const finalQuantity = Math.min(quantity, selectedStock);
    const added = addCartItem({
      id: `${product.id}-${selectedColor}-${customPrint ? "custom" : "plain"}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      image: selectedVariant?.image ?? product.images[0],
      color: colorName,
      variantCode: selectedColor,
      stock: selectedStock,
      price: unitPrice,
      quantity: finalQuantity,
      customPrint,
      customText: customPrint ? customText.trim() : "",
      fileName: customPrint ? fileName : "",
      note: customPrint ? note.trim() : "",
    });
    if (added)
      toast.success(`${product.name} masuk ke keranjang`, {
        description: `${colorName} · ${finalQuantity} pcs · ${formatPrice(unitPrice)} / pcs`,
        action: { label: "Lihat keranjang", onClick: () => navigate("/keranjang/") },
      });
  };
  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File terlalu besar", {
        description: "Maksimal ukuran file adalah 8 MB.",
      });
      return;
    }
    setFileName(file.name);
  };

  const availableVariants = getAvailableVariants(product);
  const activeIndex = Math.max(
    0,
    availableVariants.findIndex((variant) => variant.code === selectedColor),
  );
  const mainImage = selectedVariant?.image ?? product.images[0];
  const stepImage = (direction: 1 | -1) => {
    if (!availableVariants.length) return;
    const next =
      (activeIndex + direction + availableVariants.length) % availableVariants.length;
    selectVariant(availableVariants[next].code);
  };

  return (
    <div className="bg-[#f9f9f7] text-black" data-testid="product-detail-page">
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div
          className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#666]"
          data-testid="product-breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-black"
            data-testid="product-breadcrumb-home"
          >
            Beranda
          </Link>
          <span>/</span>
          <Link
            to="/katalog/"
            className="hover:text-black"
            data-testid="product-breadcrumb-catalog"
          >
            Katalog
          </Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:gap-20">
          <section className="min-w-0 lg:sticky lg:top-28 lg:self-start" data-testid="product-gallery">
            <div className="relative overflow-hidden bg-white">
              <img
                key={mainImage}
                src={mainImage}
                alt={`${product.name} warna ${colorName}`}
                className="aspect-[4/3] w-full animate-in object-cover fade-in duration-300"
                data-testid="product-main-image"
              />
              <img
                src="/scoot-eyewear-wordmark-dark.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 left-3 z-10 h-auto w-16 rounded-sm bg-white/90 px-1.5 py-1 shadow-sm sm:w-20"
              />
              <span
                className="absolute left-3 top-3 font-mono text-[10px] font-bold tracking-[0.16em] text-white mix-blend-difference"
                data-testid="product-gallery-counter"
              >
                {String(activeIndex + 1).padStart(2, "0")} / {String(availableVariants.length).padStart(2, "0")}
              </span>
              {availableVariants.length > 1 && (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => stepImage(-1)}
                    className="flex h-10 w-10 items-center justify-center bg-white/90 text-black transition-colors hover:bg-black hover:text-white"
                    aria-label="Foto sebelumnya"
                    data-testid="product-gallery-previous"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepImage(1)}
                    className="flex h-10 w-10 items-center justify-center bg-white/90 text-black transition-colors hover:bg-black hover:text-white"
                    aria-label="Foto berikutnya"
                    data-testid="product-gallery-next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
            {availableVariants.length > 1 && (
              <div
                className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]"
                data-testid="product-gallery-thumbnails"
              >
                {availableVariants.map((variant, index) => (
                  <button
                    type="button"
                    key={variant.code}
                    onClick={() => selectVariant(variant.code)}
                    className={`relative w-20 shrink-0 overflow-hidden border-2 bg-white transition-colors sm:w-24 ${index === activeIndex ? "border-black" : "border-transparent hover:border-black/40"}`}
                    aria-label={`Lihat warna ${variant.color}`}
                    aria-pressed={index === activeIndex}
                    data-testid={`product-gallery-thumbnail-${index + 1}`}
                  >
                    <img
                      src={variant.image}
                      alt=""
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
          <section data-testid="product-purchase-panel">
            <p
              className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8102e]"
              data-testid="product-collection-label"
            >
              {product.collection} · KOLEKSI {product.index}
            </p>
            <h1
              className="mt-5 font-heading text-6xl font-bold uppercase leading-[0.82] tracking-[-0.09em] sm:text-8xl"
              data-testid="product-title"
            >
              {product.name}
            </h1>
            <p
              className="mt-6 max-w-lg text-base leading-relaxed text-[#666]"
              data-testid="product-description"
            >
              {product.description}
            </p>
            <div
              className="mt-7 border-y border-black py-5"
              data-testid="product-price-block"
            >
              <span
                className="font-heading text-3xl font-bold tracking-[-0.06em]"
                data-testid="product-price"
              >
                {formatPrice(unitPrice)}
                <span className="font-mono text-xs font-normal tracking-normal text-[#666]">
                  /pcs
                </span>
              </span>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#666]">
                Harga {customPrint ? "custom print" : "kacamata polos"}
              </p>
            </div>
            <div className="mt-7" data-testid="product-color-selector">
              <p
                className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                data-testid="product-color-label"
              >
                Pilihan warna bingkai
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableVariants.map((variant) => {
                  const selected = selectedColor === variant.code;
                  return (
                    <button
                      type="button"
                      key={variant.code}
                      onClick={() => selectVariant(variant.code)}
                      aria-pressed={selected}
                      className={`flex items-center gap-3 border p-2 text-left transition-colors ${selected ? "border-black bg-black text-white" : "border-black/30 hover:border-black"}`}
                      data-testid={`product-color-${variant.color.toLowerCase().replaceAll("/", "-").replaceAll(" ", "-")}`}
                      title={`${variant.stock} pcs tersedia`}
                    >
                      <img
                        src={variant.image}
                        alt={variant.color}
                        className="h-12 w-12 shrink-0 object-cover"
                      />
                      <span>
                        <span className="block text-xs font-bold">
                          {variant.color}
                        </span>
                        <span className="mt-1 block font-mono text-[9px] uppercase opacity-70">
                          {variant.stock} pcs
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-7" data-testid="product-variant-selector">
              <p
                className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                data-testid="variant-selector-label"
              >
                Pilihan produk
              </p>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => setCustomPrint(false)}
                  className={`flex items-center justify-between border p-4 text-left transition-colors ${!customPrint ? "border-black bg-black text-white" : "border-black/30"}`}
                  data-testid="plain-variant-button"
                >
                  <span>
                    <strong className="block font-mono text-[10px] uppercase tracking-[0.12em]">
                      Kacamata polos
                    </strong>
                    <small className="mt-1 block text-xs opacity-70">
                      Tanpa custom print
                    </small>
                  </span>
                  <span className="font-mono text-xs font-bold">
                    {formatPrice(product.price)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPrint(true)}
                  className={`flex items-center justify-between border p-4 text-left transition-colors ${customPrint ? "border-black bg-black text-white" : "border-black/30"}`}
                  data-testid="custom-variant-button"
                >
                  <span>
                    <strong className="block font-mono text-[10px] uppercase tracking-[0.12em]">
                      Custom print
                    </strong>
                    <small className="mt-1 block text-xs opacity-70">
                      Termasuk pouch hitam & box cokelat
                    </small>
                  </span>
                  <span className="font-mono text-xs font-bold">
                    {formatPrice(product.price + CUSTOM_PRINT_PRICE)}
                  </span>
                </button>
              </div>
            </div>
            {customPrint && (
              <div
                className="mt-7 space-y-5 border-l-2 border-[#c8102e] pl-5"
                data-testid="custom-print-form"
              >
                <div>
                  <label
                    htmlFor="custom-text"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                    data-testid="custom-text-label"
                  >
                    Tulisan custom{" "}
                    <span className="font-normal text-[#666]">(opsional)</span>
                  </label>
                  <p className="mt-1 text-xs text-[#666]">
                    Print berada di bagian luar gagang/tangkai.
                  </p>
                  <input
                    id="custom-text"
                    value={customText}
                    onChange={(event) => setCustomText(event.target.value)}
                    maxLength={30}
                    placeholder="Nama, inisial, atau frasa pendek"
                    className="mt-3 w-full border-b border-black bg-transparent py-3 text-sm outline-none focus:border-[#c8102e]"
                    data-testid="custom-text-input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-file"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                    data-testid="custom-file-label"
                  >
                    Unggah logo atau desain{" "}
                    <span className="font-normal text-[#666]">(opsional)</span>
                  </label>
                  <div className="mt-3 flex items-stretch gap-2">
                    <label
                      htmlFor="custom-file"
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border border-dashed border-black/40 p-4 text-xs hover:border-[#c8102e]"
                      data-testid="custom-file-dropzone"
                    >
                      <Upload size={15} className="shrink-0" />
                      <span className="truncate">{fileName || "Pilih file · maksimal 8 MB"}</span>
                    </label>
                    {fileName && (
                      <button
                        type="button"
                        onClick={() => setFileName("")}
                        className="flex w-12 items-center justify-center border border-black/40 hover:border-[#c8102e] hover:text-[#c8102e]"
                        aria-label="Hapus file"
                        data-testid="custom-file-clear"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  {fileName && (
                    <p className="mt-2 text-xs text-[#666]">
                      Nama file dicatat di pesanan. Lampirkan file aslinya di chat WhatsApp.
                    </p>
                  )}
                  <input
                    id="custom-file"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => {
                      handleFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                    className="sr-only"
                    data-testid="custom-file-input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-note"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                    data-testid="custom-note-label"
                  >
                    Catatan tambahan{" "}
                    <span className="font-normal text-[#666]">(opsional)</span>
                  </label>
                  <textarea
                    id="custom-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Jelaskan referensi desainmu"
                    className="mt-3 w-full resize-none border border-black/30 bg-transparent p-3 text-sm outline-none focus:border-black"
                    data-testid="custom-note-input"
                  />
                </div>
              </div>
            )}
            <div
              className="mt-8 flex items-center justify-between border-y border-black/15 py-4"
              data-testid="quantity-selector"
            >
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                data-testid="quantity-label"
              >
                Jumlah
              </span>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center border border-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                  aria-label="Kurangi jumlah"
                  data-testid="quantity-decrease-button"
                >
                  <Minus size={13} />
                </button>
                <span
                  className="min-w-6 text-center font-mono text-sm"
                  aria-live="polite"
                  data-testid="quantity-value"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(selectedStock, value + 1))}
                  className="flex h-10 w-10 items-center justify-center border border-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                  aria-label="Tambah jumlah"
                  data-testid="quantity-increase-button"
                  disabled={quantityAtLimit}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
            <p
              className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-[#666]"
              data-testid="product-order-note"
            >
              {selectedStock > 0
                ? `Stok ${colorName}: ${selectedStock} pcs · Harga website berlaku sampai 100 pcs.`
                : "Varian ini sedang habis."}
            </p>
            <button
              type="button"
              onClick={addItem}
              className="mt-6 flex w-full items-center justify-center gap-3 bg-black px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#c8102e] disabled:cursor-not-allowed disabled:bg-black/40"
              data-testid="add-to-cart-button"
              disabled={selectedStock <= 0}
            >
              {selectedStock > 0 ? "Tambah ke keranjang" : "Stok habis"} <ArrowRight size={14} />
            </button>
            <a
              href={whatsappUrl(whatsappText)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-3 border border-black px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-colors hover:bg-black hover:text-white"
              data-testid="product-whatsapp-button"
            >
              Tanya via WhatsApp ↗
            </a>
            <div
              className="mt-10 divide-y divide-black/15 border-y border-black/15"
              data-testid="product-information-accordions"
            >
              <details className="group py-5" open>
                <summary
                  className="flex cursor-pointer list-none items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                  data-testid="product-info-summary"
                >
                  Informasi produk{" "}
                  <Plus size={14} className="transition group-open:rotate-45" />
                </summary>
                <p
                  className="mt-4 text-sm leading-relaxed text-[#666]"
                  data-testid="product-info-content"
                >
                  {product.description} Foto memperlihatkan model dan tampilan
                  koleksi. Ukuran teknis belum tersedia.
                </p>
              </details>
              <details className="group py-5">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                  data-testid="custom-package-summary"
                >
                  Paket custom print{" "}
                  <Plus size={14} className="transition group-open:rotate-45" />
                </summary>
                <p
                  className="mt-4 text-sm leading-relaxed text-[#666]"
                  data-testid="custom-package-content"
                >
                  1 pasang kacamata dengan print pada sisi luar gagang, 1 pouch
                  hitam polos, dan 1 box cokelat polos.
                </p>
              </details>
              <details className="group py-5">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                  data-testid="order-information-summary"
                >
                  Informasi pemesanan{" "}
                  <Plus size={14} className="transition group-open:rotate-45" />
                </summary>
                <p
                  className="mt-4 text-sm leading-relaxed text-[#666]"
                  data-testid="order-information-content"
                >
                  Harga website berlaku hingga 100 pcs. Untuk lebih dari 100
                  pcs, hubungi admin untuk penawaran khusus. Ongkir dan
                  pembayaran dikonfirmasi admin.
                </p>
              </details>
            </div>
            <button
              type="button"
              onClick={() => navigate("/katalog/")}
              className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
              data-testid="back-to-catalog-button"
            >
              <ArrowLeft size={14} /> Lihat semua model
            </button>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
