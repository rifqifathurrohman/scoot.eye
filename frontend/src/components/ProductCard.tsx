import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group" data-testid={`product-card-${product.id}`}>
      <Link to={`/produk/${product.id}/?foto=1`} className="relative block overflow-hidden bg-[#e9e8e4]" data-testid={`product-image-link-${product.id}`}>
        <div className="absolute left-3 top-3 z-10 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white mix-blend-difference" data-testid={`product-index-${product.id}`}>SCOOT / {product.index}</div>
        <img src={product.images[0]} alt={`Kacamata model ${product.name}`} className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" loading="lazy" data-testid={`product-image-${product.id}`} />
        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-white text-black opacity-0 transition-opacity duration-300 group-hover:opacity-100" data-testid={`product-hover-arrow-${product.id}`}><ArrowUpRight size={16} /></span>
      </Link>
      <div className="pt-4" data-testid={`product-info-${product.id}`}>
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#666]" data-testid={`product-collection-${product.id}`}>{product.collection}</p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <Link to={`/produk/${product.id}/?foto=1`} className="font-heading text-2xl font-bold uppercase tracking-[-0.06em] hover:text-[#c8102e]" data-testid={`product-name-link-${product.id}`}>{product.name}</Link>
          <span className="whitespace-nowrap font-mono text-[11px] font-bold" data-testid={`product-price-${product.id}`}>{formatPrice(product.price)}<span className="font-normal text-[#666]">/pcs</span></span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#666]" data-testid={`product-description-${product.id}`}>{product.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-black/15 pt-3 font-mono text-[9px] uppercase tracking-[0.12em]" data-testid={`product-meta-${product.id}`}>
          <span>Pilih warna: {product.colors[0]}</span>
          <span className="text-[#c8102e]">Custom +Rp15.000</span>
        </div>
      </div>
    </article>
  );
}