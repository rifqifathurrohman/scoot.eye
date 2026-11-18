import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatPrice,
  getAvailableVariants,
  getDominantFrameColor,
  getProductStock,
} from "@/lib/catalog";
import type { Product } from "@/lib/catalog";

export default function ProductCard({
  product,
  selectedColor = "all",
  customMode = false,
}: {
  product: Product;
  selectedColor?: string;
  customMode?: boolean;
}) {
  const inStock = getProductStock(product);
  const allAvailableVariants = getAvailableVariants(product);
  const availableVariants =
    selectedColor === "all"
      ? allAvailableVariants
      : allAvailableVariants.filter(
          (item) => getDominantFrameColor(item.color) === selectedColor,
        );
  const filteredStock = availableVariants.reduce(
    (total, item) => total + item.stock,
    0,
  );
  const [activeVariantCode, setActiveVariantCode] = useState(
    availableVariants[0]?.code,
  );

  useEffect(() => {
    setActiveVariantCode(availableVariants[0]?.code);
  }, [selectedColor, product.id]);

  const selectedVariant =
    availableVariants.find((item) => item.code === activeVariantCode) ??
    availableVariants[0];
  const cardImage = selectedVariant?.image ?? product.images[0];
  // Carry the chosen swatch (and custom-print intent) into the detail page.
  const photoIndex = Math.max(
    0,
    allAvailableVariants.findIndex((item) => item.code === selectedVariant?.code),
  );
  const detailHref = `/produk/${product.id}/?foto=${photoIndex + 1}${customMode ? "&custom=1" : ""}`;

  return (
    <article className="group" data-testid={`product-card-${product.id}`}>
      <Link
        to={detailHref}
        className="relative block overflow-hidden bg-white"
        data-testid={`product-image-link-${product.id}`}
      >
        <div
          className="absolute left-3 top-3 z-10 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white mix-blend-difference"
          data-testid={`product-index-${product.id}`}
        >
          SCOOT / {product.index}
        </div>
        <img
          src={cardImage}
          alt={`Kacamata model ${product.name}`}
          className={`aspect-square w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.06] ${
            inStock === 0 ? "grayscale" : ""
          }`}
          loading="lazy"
          data-testid={`product-image-${product.id}`}
        />
        {inStock === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            data-testid={`product-out-of-stock-${product.id}`}
          >
            <span className="rotate-[-8deg] border-4 border-white px-5 py-3 text-xl font-bold uppercase tracking-[0.15em] text-white">
              OUT OF STOCK
            </span>
          </div>
        )}
        <span
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-white text-black opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          data-testid={`product-hover-arrow-${product.id}`}
        >
          <ArrowUpRight size={16} />
        </span>
        <img
          src="/scoot-eyewear-wordmark-dark.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-3 z-20 h-auto w-16 rounded-sm bg-white/90 px-1.5 py-1 shadow-sm sm:w-20"
          data-testid={`product-watermark-${product.id}`}
        />
      </Link>
      <div className="pt-4" data-testid={`product-info-${product.id}`}>
        <p
          className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#666]"
          data-testid={`product-collection-${product.id}`}
        >
          {product.collection}
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <Link
            to={detailHref}
            className="font-heading text-2xl font-bold uppercase tracking-[-0.06em] hover:text-[#c8102e]"
            data-testid={`product-name-link-${product.id}`}
          >
            {product.name}
          </Link>
          <span
            className="whitespace-nowrap font-mono text-[11px] font-bold"
            data-testid={`product-price-${product.id}`}
          >
            {formatPrice(product.price)}
            <span className="font-normal text-[#666]">/pcs</span>
          </span>
        </div>
        <p
          className="mt-3 text-sm leading-relaxed text-[#666]"
          data-testid={`product-description-${product.id}`}
        >
          {product.description}
        </p>
        <div
          className="mt-4 flex items-center justify-between border-t border-black/15 pt-3 font-mono text-[9px] uppercase tracking-[0.12em]"
          data-testid={`product-meta-${product.id}`}
        >
          <span>
            {selectedVariant
              ? `Warna ${selectedVariant.color} · ${selectedVariant.stock} pcs`
              : selectedColor === "all"
                ? "Out of stock"
                : "Warna tidak ready untuk model ini"}
          </span>
          <span className="text-[#c8102e]">Custom +Rp15.000</span>
        </div>
        <div className="mt-4" data-testid={`product-swatches-${product.id}`}>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em]">
            Pilih warna bingkai
          </p>
          {availableVariants.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {availableVariants.map((variant) => (
                <button
                  type="button"
                  key={variant.code}
                  onClick={() => setActiveVariantCode(variant.code)}
                  className={`h-7 w-7 overflow-hidden rounded-full border-2 transition ${activeVariantCode === variant.code ? "border-black" : "border-black/20 hover:border-black"}`}
                  title={`${variant.color} · ${variant.stock} pcs`}
                  aria-label={`${variant.color}, ${variant.stock} pcs`}
                  data-testid={`product-swatch-${product.id}-${variant.code}`}
                >
                  <img
                    src={variant.image}
                    alt={variant.color}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-[#666]">
              Tidak ada warna ready untuk filter ini.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
