import { useEffect, useState } from "react";
import { builtInCatalog } from "@/lib/catalogRemote";
import { supabase } from "@/lib/supabase";

interface Summary {
  since: string;
  totals: Record<
    "visitors" | "page_view" | "shopee_click" | "whatsapp_click" | "instagram_click" | "add_to_cart" | "checkout" | "custom_design",
    number
  > & { mobile_share: number | null };
  daily: { day: string; visitors: number; page_view: number; shopee_click: number; whatsapp: number }[];
  products: { product_id: string; views: number; shopee_click: number; whatsapp_click: number; add_to_cart: number }[];
  pages: { path: string; views: number }[];
  sources: { source: string; visitors: number }[];
}

const label = "font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/60";
const RANGES = [7, 30, 90] as const;
const BAR = "#8e1b1f";
const fmt = (value: number) => new Intl.NumberFormat("id-ID").format(value);
const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00+07:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
const productName = (id: string) => builtInCatalog.find((item) => item.id === id)?.name ?? id;
const pageName = (path: string) => {
  if (path === "/") return "Beranda";
  const product = path.match(/^\/produk\/([^/]+)/)?.[1];
  if (product) return `Produk · ${productName(product)}`;
  return path.replace(/^\/|\/$/g, "").replace(/-/g, " ") || path;
};

export default function AnalyticsPanel() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase.rpc("analytics_summary", { days }).then(({ data: result, error: rpcError }) => {
      if (cancelled) return;
      setLoading(false);
      if (rpcError) {
        setError(
          rpcError.code === "PGRST202"
            ? "Fitur analitik belum aktif: jalankan supabase/migrations/003_analytics.sql di SQL Editor Supabase."
            : rpcError.message,
        );
        return;
      }
      setError("");
      setData(result as Summary);
    });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const t = data?.totals;
  const conversion = t && t.visitors ? Math.round((100 * (t.shopee_click + t.whatsapp_click + t.checkout)) / t.visitors) : 0;

  return (
    <div className="space-y-6" data-testid="admin-analytics">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heading text-3xl font-bold uppercase tracking-[-0.06em]">Pengunjung &amp; klik</p>
          <p className="mt-1 text-sm text-black/60">Data dari website sendiri, tanpa data pribadi. Waktu dalam WIB.</p>
        </div>
        <div className="flex border border-black" role="group" aria-label="Rentang waktu">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              aria-pressed={days === range}
              className={`px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${days === range ? "bg-black text-white" : "bg-white hover:bg-black/5"}`}
            >
              {range} hari
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="border border-black bg-white p-5 text-sm">{error}</div>
      ) : !data || !t ? (
        <p className={label}>{loading ? "Memuat analitik…" : "Belum ada data."}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Pengunjung unik", fmt(t.visitors), t.mobile_share != null ? `${t.mobile_share}% dari HP` : ""],
              ["Halaman dilihat", fmt(t.page_view), t.visitors ? `${(t.page_view / t.visitors).toFixed(1)} per pengunjung` : ""],
              ["Klik ke Shopee", fmt(t.shopee_click), ""],
              ["Klik WhatsApp", fmt(t.whatsapp_click), `+ ${fmt(t.checkout)} checkout keranjang`],
              ["Tambah ke keranjang", fmt(t.add_to_cart), ""],
              ["Pakai desain custom", fmt(t.custom_design), "dari editor custom print"],
              ["Klik Instagram", fmt(t.instagram_click), ""],
              ["Pengunjung → klik beli", `${conversion}%`, "Shopee + WhatsApp + checkout"],
            ].map(([title, value, note]) => (
              <div key={title} className="border border-black bg-white p-4">
                <p className={label}>{title}</p>
                <p className="mt-2 font-heading text-3xl font-bold tracking-[-0.06em]">{value}</p>
                {note && <p className="mt-1 text-xs text-black/55">{note}</p>}
              </div>
            ))}
          </section>

          <DailyChart daily={data.daily} />

          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <section className="border border-black bg-white">
              <p className="border-b border-black/15 p-4 font-heading text-xl font-bold uppercase tracking-[-0.05em]">Per model</p>
              {data.products.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[440px] text-sm">
                    <thead>
                      <tr className="text-left">
                        {["Model", "Dilihat", "Shopee", "WhatsApp", "Keranjang"].map((head, index) => (
                          <th key={head} className={`${label} px-4 py-2 ${index ? "text-right" : ""}`}>{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.map((row) => (
                        <tr key={row.product_id} className="border-t border-black/10">
                          <td className="px-4 py-2 font-medium">{productName(row.product_id)}</td>
                          {[row.views, row.shopee_click, row.whatsapp_click, row.add_to_cart].map((value, index) => (
                            <td key={index} className="px-4 py-2 text-right tabular-nums">{fmt(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-4 text-sm text-black/55">Belum ada kunjungan ke halaman produk.</p>
              )}
            </section>

            <div className="space-y-6">
              <RankList title="Sumber pengunjung" rows={data.sources.map((row) => [row.source, row.visitors])} empty="Belum ada data sumber." />
              <RankList title="Halaman terpopuler" rows={data.pages.map((row) => [pageName(row.path), row.views])} empty="Belum ada kunjungan." />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** Visitors per day: one series, thin bars on a recessive grid, hover/focus tooltip per bar. */
function DailyChart({ daily }: { daily: Summary["daily"] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.visitors));
  const step = max <= 5 ? 1 : Math.ceil(max / 4 / 5) * 5;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const labelEvery = Math.ceil(daily.length / 8);
  const current = active != null ? daily[active] : null;

  return (
    <section className="border border-black bg-white p-4" data-testid="admin-daily-chart">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-heading text-xl font-bold uppercase tracking-[-0.05em]">Pengunjung unik per hari</p>
        <p className="min-h-[1.25rem] text-xs text-black/70" aria-live="polite">
          {current
            ? `${dayLabel(current.day)} · ${fmt(current.visitors)} pengunjung · ${fmt(current.page_view)} halaman · ${fmt(current.shopee_click)} klik Shopee · ${fmt(current.whatsapp)} WhatsApp`
            : "Arahkan ke batang untuk detail"}
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="relative w-8 shrink-0 text-right text-[10px] tabular-nums text-black/45" style={{ height: 180 }}>
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - (tick / top) * 100}%` }}>
              {fmt(tick)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height: 180 }}>
            {ticks.map((tick) => (
              <div key={tick} className="absolute inset-x-0 border-t border-black/10" style={{ top: `${100 - (tick / top) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end" style={{ gap: 2 }} onMouseLeave={() => setActive(null)}>
              {daily.map((d, index) => (
                <button
                  key={d.day}
                  type="button"
                  className="group relative flex h-full min-w-0 flex-1 items-end focus:outline-none"
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  aria-label={`${dayLabel(d.day)}: ${d.visitors} pengunjung`}
                >
                  <span
                    className="w-full rounded-t-[4px] transition-opacity group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-black"
                    style={{
                      height: `${(d.visitors / top) * 100}%`,
                      minHeight: d.visitors ? 2 : 0,
                      background: BAR,
                      opacity: active == null || active === index ? 1 : 0.35,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex text-[10px] text-black/45" style={{ gap: 2 }}>
            {daily.map((d, index) => (
              <span key={d.day} className="min-w-0 flex-1 overflow-visible whitespace-nowrap">
                {index % labelEvery === 0 ? dayLabel(d.day) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RankList({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...rows.map(([, value]) => value));
  return (
    <section className="border border-black bg-white">
      <p className="border-b border-black/15 p-4 font-heading text-xl font-bold uppercase tracking-[-0.05em]">{title}</p>
      {rows.length ? (
        <ul className="space-y-3 p-4">
          {rows.map(([name, value]) => (
            <li key={name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{name}</span>
                <span className="tabular-nums text-black/70">{fmt(value)}</span>
              </div>
              <div className="mt-1 h-1.5 bg-black/5">
                <div className="h-full rounded-r-[4px]" style={{ width: `${(value / max) * 100}%`, background: BAR }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-4 text-sm text-black/55">{empty}</p>
      )}
    </section>
  );
}
