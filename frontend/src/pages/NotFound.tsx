import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="bg-[#f9f9f7] text-black" data-testid="not-found-page">
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 lg:px-12 lg:py-32">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8102e]">
          404 · Halaman tidak ditemukan
        </p>
        <h1 className="mt-5 font-heading text-6xl font-bold uppercase leading-[0.82] tracking-[-0.09em] sm:text-9xl">
          Salah
          <br />
          belok.
        </h1>
        <p className="mt-8 max-w-md text-base leading-relaxed text-[#666]">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/katalog/"
            className="inline-flex items-center gap-3 bg-black px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c8102e]"
            data-testid="not-found-catalog-link"
          >
            Jelajahi katalog <ArrowRight size={15} />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-3 border border-black px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-black hover:text-white"
            data-testid="not-found-home-link"
          >
            Ke beranda
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
