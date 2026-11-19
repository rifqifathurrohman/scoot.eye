import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const details = [
  { src: "/custom/logo-yellow-blue.webp", label: "Logo kuning", frame: "Frame hitam · lensa biru" },
  { src: "/custom/logo-red-black.webp", label: "Logo merah", frame: "Frame hitam · lensa gelap" },
  { src: "/custom/logo-yellow-tortoise.webp", label: "Logo kuning", frame: "Frame tortoise" },
  { src: "/custom/logo-red-lens.webp", label: "Logo merah", frame: "Frame hitam · lensa merah" },
];

/** Real customer-style results: the full flat-lay plus four close-ups of the engraved logo on the temple. */
export default function CustomShowcase({ className = "" }: { className?: string }) {
  return (
    <section className={`grid border-b border-black bg-[#f9f9f7] lg:grid-cols-[5fr_7fr] ${className}`} data-testid="custom-showcase">
      <div className="group relative overflow-hidden border-b border-black bg-[#efefed] lg:min-h-[560px] lg:border-b-0 lg:border-r">
        <img
          src="/custom/custom-results.webp"
          alt="Empat kacamata SCOOT dengan custom print logo bintang kuning dan merah di gagang"
          className="aspect-[4/5] w-full object-cover object-[50%_35%] transition duration-[1200ms] group-hover:scale-[1.04] lg:aspect-auto lg:h-full lg:min-h-[560px] lg:absolute lg:inset-0"
          loading="lazy"
          data-testid="custom-showcase-photo"
        />
        <span className="absolute left-4 top-4 bg-black px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white sm:left-6 sm:top-6">
          Hasil custom asli
        </span>
      </div>
      <div className="flex flex-col justify-between gap-10 p-6 py-12 sm:p-12 lg:p-16">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8102e]">Custom print · logo</p>
          <h2 className="mt-4 font-heading text-5xl font-bold uppercase leading-[0.86] tracking-[-0.08em] sm:text-7xl" data-testid="custom-showcase-heading">
            Logo kamu,<br />di gagang.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#666]">
            Contoh grafir logo kecil di bagian luar gagang. Grafir mengikis permukaan frame, jadi warna yang muncul adalah warna dasar materialnya. Kirim logo komunitas, brand, atau simbol pribadimu.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" data-testid="custom-showcase-details">
          {details.map((item, index) => (
            <figure key={item.src} className="group overflow-hidden border border-black bg-white">
              <div className="overflow-hidden">
                <img src={item.src} alt={`${item.label} di gagang, ${item.frame.toLowerCase()}`} className="aspect-square w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
              </div>
              <figcaption className="flex items-baseline justify-between gap-2 border-t border-black px-3 py-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
                  {String(index + 1).padStart(2, "0")} · {item.label}
                </span>
                <span className="hidden text-[11px] text-[#666] sm:inline lg:hidden">{item.frame}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <Link to="/katalog/?custom=1" className="inline-flex w-fit items-center gap-3 bg-black px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c8102e]" data-testid="custom-showcase-link">
          Buat versimu · +Rp15.000 <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
