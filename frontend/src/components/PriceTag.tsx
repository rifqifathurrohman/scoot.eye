import { formatPrice, isDiscounted, priceOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";

// Current price with the regular price struck through while the opening promo runs.
export default function PriceTag({
  product,
  extra = 0,
  className = "",
  strikeClassName = "",
  suffix = "/pcs",
}: {
  product: Pick<Product, "price" | "openingPrice">;
  /** Added to both prices, e.g. the custom-print fee. */
  extra?: number;
  className?: string;
  strikeClassName?: string;
  suffix?: string;
}) {
  const current = priceOf(product) + extra;
  const regular = product.price + extra;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      {isDiscounted(product) && (
        <s className={`font-normal text-[#999] decoration-[#c8102e] ${strikeClassName}`} aria-label={`Harga normal ${formatPrice(regular)}`}>
          {formatPrice(regular)}
        </s>
      )}
      <span className={isDiscounted(product) ? "text-[#c8102e]" : ""}>
        {formatPrice(current)}
        {suffix && <span className="font-normal text-[#666]">{suffix}</span>}
      </span>
    </span>
  );
}
