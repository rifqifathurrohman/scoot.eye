import { LogOut, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { formatPrice } from "@/lib/catalog";
import { builtInCatalog, loadRemoteCatalog } from "@/lib/catalogRemote";
import { supabase } from "@/lib/supabase";
import type { ProductRow, PromoSetting, VariantRow } from "@/lib/supabase";

const LOW_STOCK = 5;
const input =
  "w-full border border-black/25 bg-white px-3 py-2 text-sm outline-none focus:border-black disabled:opacity-50";
const label = "font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black/60";

// The promo end is stored as an ISO instant; the form edits it as WIB wall-clock time.
const toWibInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 16);
};
const fromWibInput = (value: string) => `${value}:00+07:00`;

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const title = document.title;
    document.title = "Backoffice · SCOOT Eyewear";
    return () => {
      meta.remove();
      document.title = title;
    };
  }, []);
}

export default function Admin() {
  useNoIndex();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => setIsAdmin(!error && Boolean(data)));
  }, [session]);

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-black">
      <header className="flex items-center justify-between border-b border-black bg-white px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="" className="h-9 w-9" />
          <div>
            <p className="font-heading text-xl font-bold uppercase tracking-[-0.06em]">SCOOT Backoffice</p>
            <p className={label}>Produk · stok · harga · promo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.14em] underline sm:inline">
            Lihat website
          </Link>
          {session && (
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-2 border border-black px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-black hover:text-white"
              data-testid="admin-logout"
            >
              <LogOut size={13} /> Keluar
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {checking ? (
          <p className={label}>Memeriksa sesi…</p>
        ) : !session ? (
          <LoginForm />
        ) : isAdmin === null ? (
          <p className={label}>Memeriksa akses…</p>
        ) : !isAdmin ? (
          <div className="max-w-md border border-black bg-white p-6" data-testid="admin-denied">
            <p className="font-heading text-2xl font-bold uppercase tracking-[-0.05em]">Bukan akun admin</p>
            <p className="mt-3 text-sm text-black/70">
              Akun {session.user.email} berhasil masuk, tapi belum terdaftar sebagai admin. Tambahkan lewat SQL Editor
              Supabase (lihat supabase/README.md).
            </p>
          </div>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) toast.error("Gagal masuk", { description: "Email atau password salah." });
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-4 border border-black bg-white p-6" data-testid="admin-login">
      <p className="font-heading text-3xl font-bold uppercase tracking-[-0.06em]">Masuk</p>
      <label className="block space-y-1">
        <span className={label}>Email</span>
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
      </label>
      <label className="block space-y-1">
        <span className={label}>Password</span>
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-black py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c8102e] disabled:opacity-50"
      >
        {busy ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}

interface Draft {
  product: ProductRow;
  variants: VariantRow[];
  dirty: boolean;
}

function Dashboard() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [promo, setPromo] = useState<PromoSetting>({ end: "", label: "" });
  const [promoDirty, setPromoDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, v, s] = await Promise.all([
      supabase.from("products").select("*").order("sort_index"),
      supabase.from("product_variants").select("*").order("sort_index"),
      supabase.from("settings").select("value").eq("key", "opening_promo").maybeSingle(),
    ]);
    setLoading(false);
    if (p.error || v.error) {
      toast.error("Gagal memuat data", { description: (p.error ?? v.error)?.message });
      return;
    }
    const variants = (v.data ?? []) as VariantRow[];
    setDrafts(
      ((p.data ?? []) as ProductRow[]).map((product) => ({
        product,
        variants: variants.filter((item) => item.product_id === product.id),
        dirty: false,
      })),
    );
    if (s.data?.value) setPromo(s.data.value as PromoSetting);
    setPromoDirty(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    const all = drafts.flatMap((draft) => draft.variants);
    return {
      stock: all.reduce((sum, item) => sum + item.stock, 0),
      low: all.filter((item) => item.stock > 0 && item.stock < LOW_STOCK).length,
      empty: all.filter((item) => item.stock === 0).length,
    };
  }, [drafts]);

  const updateProduct = (id: string, patch: Partial<ProductRow>) =>
    setDrafts((list) => list.map((d) => (d.product.id === id ? { ...d, product: { ...d.product, ...patch }, dirty: true } : d)));
  const updateVariant = (id: string, code: string, patch: Partial<VariantRow>) =>
    setDrafts((list) =>
      list.map((d) =>
        d.product.id === id
          ? { ...d, dirty: true, variants: d.variants.map((item) => (item.code === code ? { ...item, ...patch } : item)) }
          : d,
      ),
    );

  const saveProduct = async (draft: Draft) => {
    setSaving(draft.product.id);
    const { id, price, opening_price, shopee_item_id, active } = draft.product;
    const productResult = await supabase
      .from("products")
      .update({ price, opening_price, shopee_item_id: shopee_item_id?.trim() || null, active })
      .eq("id", id);
    const variantResult = productResult.error
      ? null
      : await supabase.from("product_variants").upsert(
          draft.variants.map(({ product_id, code, color_name, stock, sort_index }) => ({
            product_id,
            code,
            color_name: color_name?.trim() || null,
            stock,
            sort_index,
          })),
        );
    setSaving(null);
    const error = productResult.error ?? variantResult?.error;
    if (error) {
      toast.error(`Gagal menyimpan ${draft.product.name}`, { description: error.message });
      return;
    }
    toast.success(`${draft.product.name} tersimpan`, { description: "Website memakai data baru saat halaman dibuka." });
    setDrafts((list) => list.map((d) => (d.product.id === id ? { ...d, dirty: false } : d)));
    void loadRemoteCatalog();
  };

  const savePromo = async () => {
    setSaving("promo");
    const { error } = await supabase.from("settings").upsert({ key: "opening_promo", value: promo });
    setSaving(null);
    if (error) {
      toast.error("Gagal menyimpan promo", { description: error.message });
      return;
    }
    setPromoDirty(false);
    toast.success("Promo tersimpan");
    void loadRemoteCatalog();
  };

  if (loading && !drafts.length) return <p className={label}>Memuat data…</p>;
  if (!drafts.length)
    return (
      <div className="border border-black bg-white p-6">
        <p className="font-heading text-2xl font-bold uppercase tracking-[-0.05em]">Database masih kosong</p>
        <p className="mt-2 text-sm text-black/70">Jalankan supabase/migrations/002_catalog_seed.sql di SQL Editor Supabase.</p>
      </div>
    );

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      <section className="grid gap-3 sm:grid-cols-4">
        {[
          ["Model aktif", `${drafts.filter((d) => d.product.active).length}/${drafts.length}`],
          ["Total stok", `${totals.stock} pcs`],
          ["Stok menipis (<5)", `${totals.low} varian`],
          ["Stok habis", `${totals.empty} varian`],
        ].map(([title, value]) => (
          <div key={title} className="border border-black bg-white p-4">
            <p className={label}>{title}</p>
            <p className="mt-2 font-heading text-3xl font-bold tracking-[-0.06em]">{value}</p>
          </div>
        ))}
      </section>

      <section className="border border-black bg-white p-5" data-testid="admin-promo">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <p className="font-heading text-2xl font-bold uppercase tracking-[-0.05em]">Promo opening</p>
            <p className="mt-1 text-sm text-black/60">Harga opening berlaku sampai waktu ini (WIB), lalu otomatis kembali ke harga normal.</p>
          </div>
          <label className="space-y-1">
            <span className={label}>Berakhir (WIB)</span>
            <input
              type="datetime-local"
              value={promo.end ? toWibInput(promo.end) : ""}
              onChange={(e) => {
                setPromo((p) => ({ ...p, end: fromWibInput(e.target.value) }));
                setPromoDirty(true);
              }}
              className={input}
            />
          </label>
          <label className="space-y-1">
            <span className={label}>Label</span>
            <input
              value={promo.label}
              onChange={(e) => {
                setPromo((p) => ({ ...p, label: e.target.value }));
                setPromoDirty(true);
              }}
              placeholder="s/d 29 Nov"
              className={input}
            />
          </label>
          <SaveButton busy={saving === "promo"} dirty={promoDirty} onClick={savePromo} />
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="font-heading text-3xl font-bold uppercase tracking-[-0.06em]">Produk &amp; stok</p>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] underline">
          <RefreshCw size={12} /> Muat ulang
        </button>
      </div>

      {drafts.map((draft) => {
        const base = builtInCatalog.find((item) => item.id === draft.product.id);
        const total = draft.variants.reduce((sum, item) => sum + item.stock, 0);
        return (
          <section key={draft.product.id} className={`border bg-white ${draft.dirty ? "border-[#c8102e]" : "border-black"}`} data-testid={`admin-product-${draft.product.id}`}>
            <div className="flex flex-wrap items-center gap-4 border-b border-black/15 p-4">
              {base?.images[0] && <img src={base.images[0]} alt="" className="h-14 w-14 object-contain" />}
              <div className="min-w-[140px] flex-1">
                <p className="font-heading text-2xl font-bold uppercase tracking-[-0.05em]">{draft.product.name}</p>
                <p className={label}>{total} pcs · {draft.variants.length} warna</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.product.active}
                  onChange={(e) => updateProduct(draft.product.id, { active: e.target.checked })}
                />
                Tampil di website
              </label>
              <SaveButton busy={saving === draft.product.id} dirty={draft.dirty} onClick={() => void saveProduct(draft)} />
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <label className="space-y-1">
                <span className={label}>Harga normal</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={draft.product.price}
                  onChange={(e) => updateProduct(draft.product.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                  className={input}
                />
                <span className="text-xs text-black/50">{formatPrice(draft.product.price)}</span>
              </label>
              <label className="space-y-1">
                <span className={label}>Harga opening (kosong = tanpa promo)</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={draft.product.opening_price ?? ""}
                  onChange={(e) =>
                    updateProduct(draft.product.id, { opening_price: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })
                  }
                  className={input}
                />
                <span className="text-xs text-black/50">{draft.product.opening_price ? formatPrice(draft.product.opening_price) : "—"}</span>
              </label>
              <label className="space-y-1">
                <span className={label}>ID produk Shopee</span>
                <input
                  value={draft.product.shopee_item_id ?? ""}
                  onChange={(e) => updateProduct(draft.product.id, { shopee_item_id: e.target.value.replace(/\D/g, "") || null })}
                  placeholder="mis. 49371928958"
                  className={input}
                />
              </label>
            </div>
            <div className="overflow-x-auto border-t border-black/15">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left">
                    <th className={`${label} px-4 py-2`}>Kode</th>
                    <th className={`${label} px-4 py-2`}>Nama warna</th>
                    <th className={`${label} px-4 py-2`}>Stok (pcs)</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.variants.map((item) => {
                    const builtIn = base?.variants.find((v) => v.code === item.code);
                    return (
                      <tr key={item.code} className="border-t border-black/10">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-3">
                            {builtIn && <img src={builtIn.image} alt="" className="h-9 w-9 object-contain" />}
                            <span className="font-mono text-xs font-bold">{item.code}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={item.color_name ?? ""}
                            placeholder={builtIn?.color ?? ""}
                            onChange={(e) => updateVariant(draft.product.id, item.code, { color_name: e.target.value || null })}
                            className={input}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={item.stock}
                              onChange={(e) => updateVariant(draft.product.id, item.code, { stock: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                              className={`${input} w-24`}
                              data-testid={`admin-stock-${draft.product.id}-${item.code}`}
                            />
                            {item.stock === 0 ? (
                              <span className="bg-black px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-white">Habis</span>
                            ) : item.stock < LOW_STOCK ? (
                              <span className="bg-[#c8102e] px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-white">Menipis</span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SaveButton({ busy, dirty, onClick }: { busy: boolean; dirty: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || !dirty}
      className="inline-flex items-center gap-2 bg-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#c8102e] disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Save size={13} /> {busy ? "Menyimpan…" : dirty ? "Simpan" : "Tersimpan"}
    </button>
  );
}
