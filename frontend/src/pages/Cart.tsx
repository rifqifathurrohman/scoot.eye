import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  CART_EVENT,
  cartSubtotal,
  readCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart";
import { cartItemColor, formatPrice, whatsappUrl } from "@/lib/catalog";
import type { CartItem } from "@/lib/catalog";

type CheckoutField = "name" | "phone" | "address";

const fieldClass = (invalid: boolean) =>
  `mt-2 w-full border-b bg-transparent py-2 text-sm font-normal normal-case tracking-normal outline-none transition-colors focus:border-[#c8102e] ${invalid ? "border-[#c8102e]" : "border-black"}`;

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Partial<Record<CheckoutField, string>>>({});

  useEffect(() => {
    const sync = () => setItems(readCart());
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const totalPieces = items.reduce((total, item) => total + item.quantity, 0);
  const checkoutBlocked = items.some(
    (item) => (item.stock ?? 0) <= 0 || item.quantity > (item.stock ?? 0),
  );

  const changeQuantity = (item: CartItem, quantity: number) => {
    updateCartItem(item.id, quantity);
  };

  const validate = () => {
    const next: Partial<Record<CheckoutField, string>> = {};
    if (!name.trim()) next.name = "Nama penerima wajib diisi.";
    const digits = phone.replace(/\D/g, "");
    if (!digits) next.phone = "Nomor WhatsApp wajib diisi.";
    else if (digits.length < 9 || digits.length > 15) next.phone = "Nomor WhatsApp tidak valid.";
    if (!address.trim()) next.address = "Alamat pengiriman wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const checkout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkoutBlocked) return;
    if (!validate()) {
      toast.error("Lengkapi data pengiriman", {
        description: "Nama, nomor WhatsApp, dan alamat dibutuhkan admin.",
      });
      return;
    }
    const lines = items.map((item, index) =>
      [
        `${index + 1}. ${item.name}`,
        cartItemColor(item),
        item.customPrint ? "Custom print" : "Polos",
        `${item.quantity} pcs`,
        formatPrice(item.price * item.quantity),
        item.customText ? `Tulisan: ${item.customText}` : "",
        item.fileName ? `File: ${item.fileName} (dilampirkan di chat)` : "",
        item.note ? `Catatan: ${item.note}` : "",
      ]
        .filter(Boolean)
        .join(" — "),
    );
    const message = [
      "Halo SCOOT EYEWEAR, saya ingin memesan.",
      "",
      ...lines,
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      `Nama: ${name.trim()}`,
      `WhatsApp: ${phone.trim()}`,
      `Alamat: ${address.trim()}`,
      "",
      "Saya memahami ongkir dan pembayaran akan dikonfirmasi admin.",
    ].join("\n");
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-[#f9f9f7] text-black" data-testid="cart-page">
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="border-b border-black pb-8 sm:pb-12" data-testid="cart-intro">
          <p
            className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8102e]"
            data-testid="cart-eyebrow"
          >
            Pesananmu
          </p>
          <h1
            className="mt-5 font-heading text-5xl font-bold uppercase leading-[0.82] tracking-[-0.09em] sm:text-8xl"
            data-testid="cart-heading"
          >
            Keranjang
            <br />
            belanja.
          </h1>
          <p
            className="mt-6 max-w-xl text-base leading-relaxed text-[#666] sm:mt-7"
            data-testid="cart-description"
          >
            Periksa pilihan produk dan detail custom sebelum menghubungi admin.
          </p>
        </div>
        {items.length === 0 ? (
          <section className="py-24 text-center" data-testid="empty-cart-state">
            <p
              className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8102e]"
              data-testid="empty-cart-label"
            >
              Belum ada pilihan
            </p>
            <h2
              className="mt-5 font-heading text-4xl font-bold uppercase tracking-[-0.08em] sm:text-5xl"
              data-testid="empty-cart-heading"
            >
              Keranjangmu masih kosong.
            </h2>
            <p
              className="mx-auto mt-4 max-w-md text-sm text-[#666]"
              data-testid="empty-cart-copy"
            >
              Pilih model dari katalog untuk memulai pesanan.
            </p>
            <Link
              to="/katalog/"
              className="mt-8 inline-flex items-center gap-3 bg-black px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c8102e]"
              data-testid="empty-cart-catalog-link"
            >
              Jelajahi katalog <ArrowRight size={15} />
            </Link>
          </section>
        ) : (
          <div className="grid gap-12 py-10 sm:py-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20">
            <section data-testid="cart-items-section">
              <div className="mb-2 flex justify-between border-b border-black pb-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em]">
                <span data-testid="cart-items-label">Produk pilihan</span>
                <span data-testid="cart-items-count">
                  {items.length} item · {totalPieces} pcs
                </span>
              </div>
              <div className="divide-y divide-black/20">
                {items.map((item) => {
                  const stock = item.stock ?? 0;
                  const outOfStock = stock <= 0;
                  return (
                    <article
                      key={item.id}
                      className="grid grid-cols-[88px_1fr] gap-x-4 gap-y-4 py-6 sm:grid-cols-[120px_1fr_auto] sm:gap-x-5"
                      data-testid={`cart-item-${item.id}`}
                    >
                      <Link
                        to={`/produk/${item.productId}/`}
                        className="block self-start bg-[#e9e8e4]"
                        aria-label={`Lihat ${item.name}`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="aspect-square w-full object-cover"
                          data-testid={`cart-item-image-${item.id}`}
                        />
                      </Link>
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#666]">
                          SCOOT ORIGINALS
                        </p>
                        <h2
                          className="mt-1 font-heading text-2xl font-bold uppercase tracking-[-0.06em] sm:mt-2 sm:text-3xl"
                          data-testid={`cart-item-name-${item.id}`}
                        >
                          <Link to={`/produk/${item.productId}/`} className="hover:text-[#c8102e]">
                            {item.name}
                          </Link>
                        </h2>
                        <p className="mt-1 text-sm text-[#666] sm:mt-2">
                          {cartItemColor(item)} · {item.customPrint ? "Custom print" : "Polos"} ·{" "}
                          {formatPrice(item.price)}/pcs
                        </p>
                        {item.customText && (
                          <p
                            className="mt-2 break-words text-xs text-[#666]"
                            data-testid={`cart-item-custom-text-${item.id}`}
                          >
                            Tulisan: {item.customText}
                          </p>
                        )}
                        {item.fileName && (
                          <p className="mt-1 break-all text-xs text-[#666]">File: {item.fileName}</p>
                        )}
                        {item.note && (
                          <p className="mt-1 break-words text-xs text-[#666]">Catatan: {item.note}</p>
                        )}
                        {outOfStock && (
                          <p className="mt-2 text-xs font-bold text-[#c8102e]">
                            Varian ini sedang habis. Hapus untuk melanjutkan checkout.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            removeCartItem(item.id);
                            toast(`${item.name} dihapus dari keranjang`);
                          }}
                          className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#c8102e] hover:underline"
                          data-testid={`cart-remove-button-${item.id}`}
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                      <div className="col-span-2 flex items-center justify-between gap-6 sm:col-span-1 sm:flex-col sm:items-end sm:justify-start">
                        <div className="flex items-center border border-black">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item, item.quantity - 1)}
                            disabled={outOfStock || item.quantity <= 1}
                            className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                            aria-label={`Kurangi jumlah ${item.name}`}
                            data-testid={`cart-decrease-button-${item.id}`}
                          >
                            <Minus size={13} />
                          </button>
                          <span
                            className="min-w-8 text-center font-mono text-xs"
                            aria-live="polite"
                            data-testid={`cart-quantity-${item.id}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item, item.quantity + 1)}
                            disabled={outOfStock || item.quantity >= stock}
                            className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                            aria-label={`Tambah jumlah ${item.name}`}
                            data-testid={`cart-increase-button-${item.id}`}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p
                            className="font-mono text-sm font-bold"
                            data-testid={`cart-item-total-${item.id}`}
                          >
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {!outOfStock && item.quantity >= stock && (
                            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#666]">
                              Maks. stok {stock} pcs
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <Link
                to="/katalog/"
                className="mt-6 inline-flex items-center gap-2 border-b border-black pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                data-testid="cart-continue-shopping-link"
              >
                Lanjut belanja <ArrowRight size={13} />
              </Link>
            </section>
            <aside
              className="h-fit border border-black p-6 lg:sticky lg:top-28"
              data-testid="cart-summary"
            >
              <p
                className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                data-testid="cart-summary-label"
              >
                Ringkasan pesanan
              </p>
              <div className="mt-6 flex items-end justify-between border-b border-black/15 pb-5">
                <span className="text-sm text-[#666]" data-testid="cart-subtotal-label">
                  Subtotal · {totalPieces} pcs
                </span>
                <strong
                  className="font-heading text-3xl tracking-[-0.06em]"
                  data-testid="cart-subtotal"
                >
                  {formatPrice(subtotal)}
                </strong>
              </div>
              <p
                className="mt-4 text-xs leading-relaxed text-[#666]"
                data-testid="cart-summary-note"
              >
                Ongkir, pembayaran, dan ketersediaan akan dikonfirmasi admin melalui WhatsApp.
              </p>
              <form onSubmit={checkout} noValidate className="mt-8" data-testid="checkout-form">
                <div className="space-y-5">
                  <label
                    className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                    htmlFor="checkout-name"
                    data-testid="checkout-name-label"
                  >
                    Nama penerima
                    <input
                      id="checkout-name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
                      }}
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "checkout-name-error" : undefined}
                      className={fieldClass(Boolean(errors.name))}
                      placeholder="Nama kamu"
                      data-testid="checkout-name-input"
                    />
                    {errors.name && (
                      <span id="checkout-name-error" className="mt-1 block font-sans text-xs font-normal normal-case tracking-normal text-[#c8102e]">
                        {errors.name}
                      </span>
                    )}
                  </label>
                  <label
                    className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                    htmlFor="checkout-phone"
                    data-testid="checkout-phone-label"
                  >
                    Nomor WhatsApp
                    <input
                      id="checkout-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        if (errors.phone) setErrors((current) => ({ ...current, phone: undefined }));
                      }}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
                      className={fieldClass(Boolean(errors.phone))}
                      placeholder="08xx xxxx xxxx"
                      data-testid="checkout-phone-input"
                    />
                    {errors.phone && (
                      <span id="checkout-phone-error" className="mt-1 block font-sans text-xs font-normal normal-case tracking-normal text-[#c8102e]">
                        {errors.phone}
                      </span>
                    )}
                  </label>
                  <label
                    className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                    htmlFor="checkout-address"
                    data-testid="checkout-address-label"
                  >
                    Alamat pengiriman
                    <textarea
                      id="checkout-address"
                      value={address}
                      onChange={(event) => {
                        setAddress(event.target.value);
                        if (errors.address) setErrors((current) => ({ ...current, address: undefined }));
                      }}
                      autoComplete="street-address"
                      rows={3}
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={errors.address ? "checkout-address-error" : undefined}
                      className={`${fieldClass(Boolean(errors.address))} resize-none`}
                      placeholder="Jalan, kota, kode pos"
                      data-testid="checkout-address-input"
                    />
                    {errors.address && (
                      <span id="checkout-address-error" className="mt-1 block font-sans text-xs font-normal normal-case tracking-normal text-[#c8102e]">
                        {errors.address}
                      </span>
                    )}
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={checkoutBlocked}
                  className="mt-8 flex w-full items-center justify-center gap-3 bg-black px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#c8102e] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black"
                  data-testid="checkout-whatsapp-button"
                >
                  Checkout via WhatsApp <ArrowRight size={15} />
                </button>
              </form>
              {checkoutBlocked && (
                <p className="mt-3 text-center text-xs text-[#c8102e]" data-testid="checkout-blocked-note">
                  Ada produk yang stoknya habis. Hapus dulu untuk melanjutkan.
                </p>
              )}
              <p
                className="mt-4 text-center text-[10px] text-[#666]"
                data-testid="checkout-file-note"
              >
                File desain custom perlu dilampirkan manual di chat WhatsApp.
              </p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
