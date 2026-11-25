import { ArrowUpRight } from "lucide-react";
import { isOpeningPromo, TOKOPEDIA_STORE_URL } from "@/lib/catalog";

interface DesignSet {
  id: string;
  title: string;
  /** Path of the Tokopedia listing under the store URL; the buyer picks design and model there. */
  listing: string;
  designs: [slug: string, name: string][];
}

// Tokopedia builds each path from the title at first save, so the Rider path still says "simbol". The ids decide.
const sets: DesignSet[] = [
  {
    id: "simbol",
    title: "Simbol",
    listing: "scoot-eyewear-kacamata-hitam-custom-print-uv-gagang-motif-simbol-peace-bintang-checker-petir-pria-wanita-1738754265108678522-1738754424777508730",
    designs: [["01-anarchy", "Anarchy"], ["02-peace", "Peace"], ["03-red-star", "Red Star"], ["04-circle-a", "Circle A"], ["05-checker", "Checker"], ["06-bolt", "Bolt"]],
  },
  {
    id: "rider",
    title: "Rider",
    listing: "scoot-eyewear-kacamata-hitam-custom-print-uv-gagang-motif-simbol-peace-bintang-checker-petir-pria-wanita-1738754887955548026-1738754895368914810",
    designs: [["07-scoot", "Scoot"], ["08-own-style", "Own Style"], ["09-piston", "Piston"], ["10-wheel", "Fast Wheel"]],
  },
  {
    id: "scooterist",
    title: "Scooterist",
    listing: "scoot-eyewear-kacamata-hitam-custom-print-uv-gagang-motif-scooterist-helm-racing-tengkorak-pria-wanita-1738755143554271098-1738755288530716538",
    designs: [["11-helmet", "Helmet"], ["12-scooterist", "Scooterist"], ["13-racing", "Scoot Racing"], ["14-ride-slow", "Ride Slow"], ["15-throttle", "Full Throttle"], ["16-skull", "Skull"]],
  },
];

const number = (slug: string) => slug.slice(0, 2);

/** The three ready-made print collections; each one links straight to its Tokopedia listing. */
export default function DesignCollections() {
  return (
    <section id="desain" className="scroll-mt-20 border-b border-black px-4 py-16 sm:px-8 lg:px-12 lg:py-24" data-testid="design-collections">
      <div className="mx-auto max-w-[1440px]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8102e]">Custom print · desain siap pakai</p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-heading text-[clamp(2.75rem,13vw,3.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.08em] sm:text-7xl" data-testid="design-collections-heading">
            Pilih<br />desainmu.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-[#666]">
            16 desain print UV untuk gagang, tinggal pilih nomornya. Pilih koleksi, lalu tentukan desain dan model kacamata di Tokopedia.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {sets.map((set) => {
            const url = `${TOKOPEDIA_STORE_URL}/${set.listing}`;
            const range = `${number(set.designs[0][0])}–${number(set.designs[set.designs.length - 1][0])}`;
            return (
              <article key={set.id} className="flex flex-col border border-black bg-white" data-testid={`design-set-${set.id}`}>
                <header className="flex items-center justify-between border-b border-black px-4 py-3">
                  <h3 className="font-heading text-3xl font-bold uppercase tracking-[-0.06em]">{set.title}</h3>
                  <span className="bg-[#c8102e] px-3 py-2 font-mono text-[10px] font-bold tracking-[0.14em] text-white">{range}</span>
                </header>
                <ul className="grid flex-1 grid-cols-2 gap-px bg-black" data-testid={`design-set-${set.id}-list`}>
                  {set.designs.map(([slug, name]) => (
                    <li key={slug} className="flex flex-col bg-white">
                      <img
                        src={`/custom/designs/${slug}.webp`}
                        alt={`Mockup desain ${number(slug)} ${name} di gagang kacamata hitam`}
                        width={640}
                        height={480}
                        className={`aspect-[4/3] w-full flex-1 object-cover ${set.designs.length === 4 ? "lg:aspect-auto lg:min-h-0" : ""}`}
                        loading="lazy"
                      />
                      <span className="px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
                        <span className="text-[#c8102e]">{number(slug)}</span> {name}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 border-t border-black bg-black px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#c8102e]"
                  aria-label={`Beli desain ${set.title} ${range} di Tokopedia`}
                  data-testid={`design-set-${set.id}-tokopedia`}
                >
                  <span>Beli di Tokopedia</span>
                  <ArrowUpRight size={15} />
                </a>
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-[#666]">
          {isOpeningPromo() ? "Harga di Tokopedia Rp120.000, Casama Rp135.000, sudah termasuk print UV, pouch, dan box. " : "Harga di Tokopedia sudah termasuk print UV, pouch, dan box. "}
          Pre-order 5 hari. Gambar mockup pada Casama hitam; ukuran dan posisi cetak menyesuaikan model.
        </p>
      </div>
    </section>
  );
}
