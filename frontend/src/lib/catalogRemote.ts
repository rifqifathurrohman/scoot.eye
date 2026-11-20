import { useSyncExternalStore } from "react";
import { products, setOpeningPromo } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";
import type { ProductRow, PromoSetting, VariantRow } from "@/lib/supabase";

// The site ships with the full catalog built in (images, descriptions, default prices and stock) and
// renders it immediately. Live values from the backoffice are then merged into those same objects,
// so if Supabase is slow or unreachable the shop still works with the built-in data.

const builtIn: Product[] = products.map((product) => ({
  ...product,
  variants: product.variants.map((item) => ({ ...item })),
}));

let version = 0;
const listeners = new Set<() => void>();
const notify = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

/** Re-render subscribers whenever live catalog data has been applied. */
export const useCatalogVersion = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version,
  );

export function applyRemoteCatalog(rows: ProductRow[], variantRows: VariantRow[], promo?: PromoSetting) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const next: Product[] = [];
  for (const base of builtIn) {
    const row = byId.get(base.id);
    if (row && !row.active) continue;
    const product: Product = { ...base, variants: base.variants.map((item) => ({ ...item })) };
    if (row) {
      product.price = row.price;
      product.openingPrice = row.opening_price ?? undefined;
      product.shopeeItemId = row.shopee_item_id ?? undefined;
    }
    for (const item of product.variants) {
      const live = variantRows.find((v) => v.product_id === base.id && v.code === item.code);
      if (!live) continue;
      item.stock = live.stock;
      if (live.color_name) item.color = live.color_name;
    }
    next.push(product);
  }
  // Mutate the shared array in place so every importer of `products` sees the live values.
  products.splice(0, products.length, ...next);
  if (promo) setOpeningPromo(new Date(promo.end), promo.label);
  notify();
}

let loading: Promise<void> | null = null;

export function loadRemoteCatalog(): Promise<void> {
  loading ??= (async () => {
    try {
      const [productsResult, variantsResult, promoResult] = await Promise.all([
        supabase.from("products").select("*").order("sort_index"),
        supabase.from("product_variants").select("*").order("sort_index"),
        supabase.from("settings").select("value").eq("key", "opening_promo").maybeSingle(),
      ]);
      if (productsResult.error || variantsResult.error) throw productsResult.error ?? variantsResult.error;
      if (!productsResult.data?.length) return; // database not seeded yet: keep the built-in catalog
      applyRemoteCatalog(
        productsResult.data as ProductRow[],
        (variantsResult.data ?? []) as VariantRow[],
        (promoResult.data?.value as PromoSetting | undefined) ?? undefined,
      );
    } catch (error) {
      console.warn("Live catalog unavailable, using built-in data.", error);
    } finally {
      loading = null;
    }
  })();
  return loading;
}

/** Built-in catalog, used by the backoffice to show defaults (colour names, images) next to live values. */
export const builtInCatalog = builtIn;
