import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCatalogVersion } from "@/lib/catalogRemote";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { readCustomDraft } from "@/lib/customDraft";
import {
  formatPrice,
  getAvailableVariants,
  getDominantFrameColor,
  priceOf,
  products,
} from "@/lib/catalog";

const modelOptions = products.map((product) => product.name);
const priceOptions = Array.from(new Set(products.map((product) => priceOf(product)))).sort((a, b) => a - b);
const availableVariants = products.flatMap((product) =>
  getAvailableVariants(product),
);

const colorOptions = Array.from(
  availableVariants
    .reduce((groups, variant) => {
      const dominant = getDominantFrameColor(variant.color);
      const existing = groups.get(dominant);
      if (existing) {
        existing.stock += variant.stock;
      } else {
        groups.set(dominant, {
          name: dominant,
          image: variant.image,
          stock: variant.stock,
        });
      }
      return groups;
    }, new Map<string, { name: string; image: string; stock: number }>())
    .values(),
).sort((a, b) => a.name.localeCompare(b.name, "id-ID"));

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [color, setColor] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("newest");
  const customMode = searchParams.get("custom") === "1";
  const [draftLabel] = useState(() => {
    if (!customMode) return "";
    const draft = readCustomDraft();
    return draft?.text || draft?.fileName || "";
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleModel = (name: string) =>
    setModels((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  const clearFilters = () => {
    setSearch("");
    setModels([]);
    setColor("all");
    setPrice("all");
    setSort("newest");
  };
  const catalogVersion = useCatalogVersion();
  const visibleProducts = useMemo(
    () =>
      products
        .filter((product) => {
          const searchMatch = product.name
            .toLowerCase()
            .includes(search.toLowerCase());
          const modelMatch =
            models.length === 0 || models.includes(product.name);
          const colorMatch =
            color === "all" ||
            getAvailableVariants(product).some(
              (variant) => getDominantFrameColor(variant.color) === color,
            );
          const priceMatch = price === "all" || priceOf(product) === Number(price);
          return searchMatch && modelMatch && colorMatch && priceMatch;
        })
        .sort((a, b) =>
          sort === "low"
            ? priceOf(a) - priceOf(b)
            : sort === "high"
              ? priceOf(b) - priceOf(a)
              : Number(b.index) - Number(a.index),
        ),
    // catalogVersion: recompute when live prices/stock arrive from the backoffice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color, models, price, search, sort, catalogVersion],
  );

  return (
    <div className="bg-[#f9f9f7] text-black" data-testid="catalog-page">
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div
          className="border-b border-black pb-12"
          data-testid="catalog-intro"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p
                className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8102e]"
                data-testid="catalog-eyebrow"
              >
                Semua model · sembilan pilihan
              </p>
              <h1
                className="mt-5 font-heading text-6xl font-bold uppercase leading-[0.82] tracking-[-0.09em] sm:text-8xl"
                data-testid="catalog-heading"
              >
                Katalog
                <br />
                kacamata.
              </h1>
              <p
                className="mt-7 max-w-xl text-base leading-relaxed text-[#666]"
                data-testid="catalog-description"
              >
                Temukan model yang paling terasa seperti dirimu. Semua foto
                berasal dari koleksi SCOOT EYEWEAR.
              </p>
            </div>
            <span
              className="hidden font-mono text-[10px] uppercase tracking-[0.16em] sm:block"
              data-testid="catalog-count-label"
            >
              {visibleProducts.length} / 09
            </span>
          </div>
          {customMode && (
            <div
              className="mt-8 flex items-center gap-3 border border-[#c8102e] bg-[#fff3f3] p-4 text-sm"
              data-testid="custom-mode-notice"
            >
              <span className="font-bold text-[#c8102e]">
                CUSTOM PRINT AKTIF
              </span>
              <span>
                {draftLabel ? (
                  <>
                    Desainmu <strong>“{draftLabel}”</strong> tersimpan. Pilih model untuk
                    melanjutkan (+Rp15.000/pcs).
                  </>
                ) : (
                  "Pilih model untuk menambahkan tulisan personal +Rp15.000/pcs."
                )}
              </span>
            </div>
          )}
        </div>
        <div className="mt-8 flex items-center justify-between gap-3 border-b border-black/15 pb-5 lg:hidden">
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
            data-testid="mobile-filter-label"
          >
            Filter & urutkan
          </span>
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            className="flex items-center gap-2 border border-black px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
            data-testid="mobile-filter-toggle"
          >
            <SlidersHorizontal size={14} /> {filtersOpen ? "Tutup" : "Buka"}
          </button>
        </div>
        <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-16">
          <aside
            className={`${filtersOpen ? "block" : "hidden"} lg:block`}
            data-testid="catalog-filters"
          >
            <div className="space-y-9 pt-2">
              <div>
                <label
                  htmlFor="catalog-search"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                  data-testid="search-label"
                >
                  Cari model
                </label>
                <div className="relative mt-3">
                  <input
                    id="catalog-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari model"
                    className="w-full border-b border-black bg-transparent py-3 pr-9 text-sm outline-none placeholder:text-[#999] focus:border-[#c8102e]"
                    data-testid="catalog-search-input"
                  />
                  <Search size={15} className="absolute right-0 top-3" />
                </div>
              </div>
              <div>
                <p
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                  data-testid="model-filter-label"
                >
                  Model
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {modelOptions.map((model) => (
                    <label
                      key={model}
                      className="flex cursor-pointer items-center gap-3 text-sm"
                      data-testid={`model-filter-${model.toLowerCase()}`}
                    >
                      <input
                        type="checkbox"
                        checked={models.includes(model)}
                        onChange={() => toggleModel(model)}
                        className="h-4 w-4 accent-[#c8102e]"
                      />
                      {model}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                  data-testid="color-filter-label"
                >
                  Warna bingkai
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColor("all")}
                    className={`border p-3 text-left font-mono text-[9px] uppercase tracking-[0.08em] ${color === "all" ? "border-black bg-black text-white" : "border-black/30 hover:border-black"}`}
                    data-testid="color-filter-all"
                  >
                    Semua warna
                  </button>
                  {colorOptions.map((option) => (
                    <button
                      type="button"
                      key={option.name}
                      onClick={() => setColor(option.name)}
                      className={`flex items-center gap-2 border p-2 text-left ${color === option.name ? "border-black bg-black text-white" : "border-black/30 hover:border-black"}`}
                      data-testid={`color-filter-${option.name.toLowerCase().replaceAll("/", "-").replaceAll(" ", "-")}`}
                    >
                      <img
                        src={option.image}
                        alt={option.name}
                        className="h-10 w-10 shrink-0 object-cover"
                      />
                      <span>
                        <span className="block text-[10px] font-bold">
                          {option.name}
                        </span>
                        <span className="mt-1 block font-mono text-[8px] uppercase opacity-70">
                          {option.stock} pcs
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                  data-testid="price-filter-label"
                >
                  Harga polos
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    ["all", "Semua harga"],
                    ...priceOptions.map((value) => [String(value), formatPrice(value)]),
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-3 text-sm"
                      data-testid={`price-filter-${value}`}
                    >
                      <input
                        type="radio"
                        name="price"
                        value={value}
                        checked={price === value}
                        onChange={() => setPrice(value)}
                        className="h-4 w-4 accent-[#c8102e]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8102e]"
                data-testid="clear-filters-button"
              >
                <X size={14} /> Reset filter
              </button>
            </div>
          </aside>
          <section data-testid="catalog-results">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-black/15 pb-5">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.14em]"
                data-testid="catalog-results-count"
              >
                {visibleProducts.length} model · Harga polos / pcs · Custom
                +Rp15.000
              </p>
              <label
                className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                data-testid="sort-label"
              >
                Urutkan
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="border-b border-black bg-transparent py-1 font-mono text-[10px] outline-none"
                  data-testid="sort-select"
                >
                  <option value="newest">Terbaru</option>
                  <option value="low">Harga terendah</option>
                  <option value="high">Harga tertinggi</option>
                </select>
              </label>
            </div>
            {visibleProducts.length ? (
              <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selectedColor={color}
                    customMode={customMode}
                  />
                ))}
              </div>
            ) : (
              <div
                className="border border-black p-10 text-center"
                data-testid="catalog-empty-state"
              >
                <p className="font-heading text-3xl font-bold uppercase tracking-[-0.06em]">
                  Model tidak ditemukan.
                </p>
                <p className="mt-3 text-sm text-[#666]">
                  Coba ubah pencarian atau filter.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 border border-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                  data-testid="catalog-empty-reset-button"
                >
                  Reset filter
                </button>
              </div>
            )}
          </section>
        </div>
        <div
          className="mt-20 grid gap-8 border-t border-black pt-10 md:grid-cols-[1fr_2fr]"
          data-testid="catalog-custom-callout"
        >
          <p
            className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8102e]"
            data-testid="catalog-custom-callout-eyebrow"
          >
            Custom print tersedia
          </p>
          <div>
            <h2
              className="font-heading text-4xl font-bold uppercase tracking-[-0.07em] sm:text-6xl"
              data-testid="catalog-custom-callout-heading"
            >
              Make your frame personal.
            </h2>
            <Link
              to="/custom-print/"
              className="mt-6 inline-flex items-center gap-2 border-b border-black pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
              data-testid="catalog-custom-callout-link"
            >
              Pelajari custom print ↗
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
