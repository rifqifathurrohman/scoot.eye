import { ArrowDown, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { Link } from "react-router-dom";
import { campaignImages, formatPrice, getVariantByCode, productById } from "@/lib/catalog";

const slides = [
  {
    kicker: "CAMPAIGN / 01",
    copy: "Eyewear inspired by individuality, vintage culture, and the freedom to express yourself.",
    product: { id: "tropic", code: "BR" },
  },
  {
    kicker: "CAMPAIGN / 02",
    copy: "Vintage soul. Modern vision. Timeless silhouettes for a style that moves with you.",
    product: { id: "kurera", code: "BR" },
  },
  {
    kicker: "CAMPAIGN / 03",
    copy: "Colorful culture, your own way. Independent eyewear for those who see beyond the ordinary.",
    product: { id: "satvale", code: "BB" },
  },
];

const featured = slides.map(({ product }) => {
  const item = productById(product.id);
  const variant = item ? getVariantByCode(item, product.code) : undefined;
  return item && variant
    ? { id: item.id, name: item.name, price: item.price, index: item.index, image: variant.image }
    : null;
});

const marqueeWords = ["Ride your own style", "Independent", "Timeless", "Custom print", "Belisima series", "Made to be yours"];

// Pointer position drives the parallax / 3D tilt through CSS variables, so moving the mouse never re-renders React.
const tilt = (x: number, y: number) => ({ "--mx": x, "--my": y }) as CSSProperties;

export default function HomeHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const slide = slides[active];
  const go = (index: number) => setActive((index + slides.length) % slides.length);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const target = sectionRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      target.style.setProperty("--mx", x.toFixed(3));
      target.style.setProperty("--my", y.toFixed(3));
    });
  };

  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current);
    sectionRef.current?.style.setProperty("--mx", "0");
    sectionRef.current?.style.setProperty("--my", "0");
    setPaused(false);
  };

  return (
    <>
      <section
        ref={sectionRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative min-h-[calc(100svh-106px)] overflow-hidden bg-black text-white [perspective:1400px]"
        style={tilt(0, 0)}
        data-testid="hero-section"
      >
        {/* Background campaign photos: cross-fade, slow push-in, and a light parallax. */}
        <div
          className="absolute -inset-6 transition-transform duration-700 ease-out motion-reduce:transform-none"
          style={{ transform: "translate3d(calc(var(--mx) * -22px), calc(var(--my) * -16px), 0)" }}
        >
          {campaignImages.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${index === active ? "opacity-100" : "opacity-0"}`}
              aria-hidden={index !== active}
            >
              <img
                key={index === active ? `active-${active}` : src}
                src={src}
                alt={index === active ? "SCOOT Eyewear editorial campaign" : ""}
                className={`h-full w-full object-cover opacity-75 ${index === active ? "hero-kenburns" : ""}`}
                // All three load up front so the cross-fade never reveals an empty frame.
                fetchPriority={index === 0 ? "high" : "low"}
                data-testid={index === active ? "hero-image" : undefined}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(100svh-106px)] max-w-[1440px] flex-col justify-between px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="flex items-start justify-between" data-testid="hero-topline">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]" data-testid="hero-brand-label">
              SCOOT EYEWEAR
            </p>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" data-testid="hero-counter">
              0{active + 1} / 0{slides.length}
            </span>
          </div>

          <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]">
            <div className="max-w-3xl pb-4" data-testid="hero-content">
              <p
                key={`kicker-${active}`}
                className="hero-fade-up font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/70"
                data-testid="hero-kicker"
              >
                {slide.kicker}
              </p>
              <h1
                className="mt-4 max-w-2xl font-heading text-[clamp(3.5rem,9vw,9rem)] font-bold uppercase leading-[0.86] tracking-[-0.09em]"
                data-testid="hero-title"
              >
                {["Ride your", "own style."].map((line, index) => (
                  <span key={line} className="block overflow-hidden pb-[0.04em]">
                    <span className="hero-line-up block" style={{ animationDelay: `${120 + index * 140}ms` }}>
                      {line}
                    </span>
                  </span>
                ))}
              </h1>
              <p
                key={`copy-${active}`}
                className="hero-fade-up mt-7 max-w-md text-base leading-relaxed text-white/80 sm:text-lg"
                data-testid="hero-copy"
              >
                {slide.copy}
              </p>
              <div className="hero-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "380ms" }} data-testid="hero-actions">
                <Link
                  to="/katalog/"
                  className="group/cta inline-flex items-center gap-3 bg-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-all hover:bg-[#c8102e] hover:text-white"
                  data-testid="hero-explore-link"
                >
                  Explore collection{" "}
                  <ArrowRight size={14} className="transition-transform group-hover/cta:translate-x-1" />
                </Link>
                <Link
                  to="/custom-print/"
                  className="inline-flex items-center gap-3 border border-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-all hover:bg-white hover:text-black"
                  data-testid="hero-custom-link"
                >
                  Customize your frame
                </Link>
              </div>
            </div>

            {/* Floating 3D product card, tilting toward the cursor. */}
            <div className="hidden pb-4 md:block" data-testid="hero-product-card">
              <div className="hero-float relative">
                <svg
                  viewBox="0 0 120 120"
                  className="hero-spin pointer-events-none absolute -left-14 -top-14 z-20 h-28 w-28 text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
                  aria-hidden="true"
                >
                  <defs>
                    <path id="hero-badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                  </defs>
                  <circle cx="60" cy="60" r="58" fill="#0b0b0b" />
                  <circle cx="60" cy="60" r="26" fill="#c8102e" />
                  <text x="60" y="64" textAnchor="middle" className="fill-current font-heading text-[11px] font-bold uppercase tracking-[-0.02em]">
                    New
                  </text>
                  <text className="fill-current font-mono text-[10.5px] font-bold uppercase tracking-[0.28em]">
                    <textPath href="#hero-badge-circle">New season · Belisima series ·</textPath>
                  </text>
                </svg>
                <Link
                  to={featured[active] ? `/produk/${featured[active].id}/` : "/katalog/"}
                  onPointerEnter={() => setPaused(true)}
                  onPointerLeave={() => setPaused(false)}
                  className="group/card relative block w-[260px] bg-white text-black shadow-[0_45px_80px_-25px_rgba(0,0,0,0.75)] transition-transform duration-500 ease-out [transform-style:preserve-3d] lg:w-[320px] motion-reduce:transform-none"
                  style={{ transform: "rotateY(calc(var(--mx) * 22deg)) rotateX(calc(var(--my) * -16deg))" }}
                  aria-label={featured[active] ? `Lihat ${featured[active].name}` : "Lihat katalog"}
                >
                  <div className="relative aspect-square overflow-hidden [transform-style:preserve-3d]">
                    {featured.map((item, index) =>
                      item ? (
                        <img
                          key={item.id}
                          src={item.image}
                          alt=""
                          className={`absolute inset-0 h-full w-full object-contain transition-all duration-700 ease-out ${index === active ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
                          style={{ transform: index === active ? "translateZ(50px)" : undefined }}
                        />
                      ) : null,
                    )}
                    {/* Glare that follows the cursor. */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light"
                      style={{
                        background:
                          "radial-gradient(circle at calc(50% + var(--mx) * 120%) calc(40% + var(--my) * 120%), rgba(255,255,255,0.9), transparent 55%)",
                      }}
                    />
                    <span className="absolute left-3 top-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-black/60">
                      SCOOT / {featured[active]?.index}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-3 border-t border-black/10 p-4" style={{ transform: "translateZ(30px)" }}>
                    <div key={`card-${active}`} className="hero-fade-up">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#666]">
                        Belisima series · Featured
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold uppercase tracking-[-0.06em]">
                        {featured[active]?.name}
                      </p>
                      <p className="mt-1 font-mono text-[11px] font-bold">
                        {featured[active] ? formatPrice(featured[active].price) : ""}
                        <span className="font-normal text-[#666]">/pcs</span>
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-black text-white transition-colors group-hover/card:bg-[#c8102e]">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-6" data-testid="hero-controls-row">
            <div className="flex min-w-0 flex-1 items-center gap-6">
              <span className="hidden shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 sm:flex" data-testid="hero-scroll-label">
                <ArrowDown size={13} className="animate-bounce motion-reduce:animate-none" /> Scroll to explore
              </span>
              <div className="flex w-full max-w-xs gap-2" data-testid="hero-progress">
                {slides.map((item, index) => (
                  <button
                    key={item.kicker}
                    type="button"
                    onClick={() => go(index)}
                    className="group/bar relative h-6 flex-1"
                    aria-label={`Tampilkan ${item.kicker.toLowerCase()}`}
                    aria-current={index === active}
                  >
                    <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-white/25 transition-colors group-hover/bar:bg-white/50" />
                    {index < active && <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-white" />}
                    {index === active && (
                      <span
                        key={`progress-${active}`}
                        className="hero-progress absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-white"
                        style={{ animationPlayState: paused ? "paused" : "running" }}
                        onAnimationEnd={() => go(active + 1)}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2" data-testid="hero-slide-controls">
              <button
                type="button"
                onClick={() => go(active - 1)}
                className="flex h-11 w-11 items-center justify-center border border-white/60 transition-colors hover:bg-white hover:text-black"
                aria-label="Previous campaign"
                data-testid="hero-previous-button"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => go(active + 1)}
                className="flex h-11 w-11 items-center justify-center border border-white/60 transition-colors hover:bg-white hover:text-black"
                aria-label="Next campaign"
                data-testid="hero-next-button"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-black bg-[#c8102e] py-3 text-white" aria-hidden="true" data-testid="hero-marquee">
        <div className="hero-marquee flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {marqueeWords.map((word) => (
                <span key={word} className="flex items-center gap-6 pr-6 font-heading text-lg font-bold uppercase tracking-[-0.02em] sm:text-xl">
                  {word}
                  <span className="text-white/60">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
