import { ArrowRight, ImagePlus, Pencil, RotateCcw, Type, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CUSTOM_PRINT_PRICE, formatPrice } from "@/lib/catalog";
import { saveCustomDraft } from "@/lib/customDraft";

const TEMPLE_IMAGE =
  "https://ftreyewear-fas8dpd2.manus.space/assets/products/brill/brill-02.webp";
// Centre and angle of the right temple in the 800×800 source photo, in % of the frame.
const ANCHOR = { x: 68.75, y: 50.5, angle: -15 };
// Zooming around this point keeps the whole temple inside the frame at 2×.
const ZOOM_ORIGIN = "80% 50%";
const MAX_CHARS = 20;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const DEMO_TEXTS = ["RIDE YOUR OWN STYLE", "R.F. · 2026", "SCOOT / 09", "★ MAKE IT YOURS"];

const FONTS = [
  { id: "bold", label: "Bold", className: "font-heading font-bold uppercase tracking-[0.14em]" },
  {
    id: "serif",
    label: "Serif",
    className: "font-['Playfair_Display_Variable',serif] font-semibold italic tracking-[0.05em]",
  },
  { id: "mono", label: "Mono", className: "font-mono font-bold uppercase tracking-[0.16em]" },
] as const;

// Engraving etches the frame's surface away, so the mark shows the material's own base colour.
// The preview approximates that with a pale, matte, slightly recessed tone; it cannot be chosen.
const ETCHED_TEXT: CSSProperties = {
  color: "rgba(238,226,208,.86)",
  textShadow: "0 -1px 0 rgba(0,0,0,.45), 0 1px 0 rgba(255,255,255,.12)",
};
const ETCHED_LOGO_FILTER = "drop-shadow(0 -1px 0 rgba(0,0,0,.45)) drop-shadow(0 1px 0 rgba(255,255,255,.1))";
const ETCHED_RGB = [238, 226, 208] as const;
// A logo alone sits near the hinge, like the real engraved samples; with text it shares the centre.
const LOGO_ONLY_SHIFT = "-6cqw";

/**
 * Turn an uploaded logo into a one-colour etched mark: only the logo's shape is kept, its background
 * (transparent, or a flat light/dark colour in JPGs) is dropped, so it never engraves as a solid box.
 */
async function etchLogo(file: File): Promise<string> {
  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = source;
    });
    const scale = Math.min(1, 512 / Math.max(image.naturalWidth || 512, image.naturalHeight || 512));
    const width = Math.max(1, Math.round((image.naturalWidth || 512) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || 512) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return source;
    context.drawImage(image, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height);
    const data = pixels.data;
    const luminance = (i: number) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 200) transparent += 1;
    const hasAlpha = transparent > (width * height) / 50;

    // Background tone = average of the four corners; the logo is whatever differs from it.
    const corners = [0, width - 1, (height - 1) * width, height * width - 1].map((index) => luminance(index * 4));
    const background = corners.reduce((sum, value) => sum + value, 0) / corners.length;

    for (let i = 0; i < data.length; i += 4) {
      const strength = hasAlpha
        ? data[i + 3] / 255
        : Math.min(1, Math.max(0, (Math.abs(luminance(i) - background) - 28) / 70));
      data[i] = ETCHED_RGB[0];
      data[i + 1] = ETCHED_RGB[1];
      data[i + 2] = ETCHED_RGB[2];
      data[i + 3] = Math.round(strength * 0.88 * 255);
    }
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(source);
  }
}

type Mode = "text" | "logo";

// Shrink the type as the line grows so it always fits the temple (~21% of the frame wide).
const fontSizeFor = (length: number, hasLogo: boolean) => {
  const room = hasLogo ? 16 : 21;
  return `${Math.min(2.6, room / Math.max(1, length) / 0.78).toFixed(2)}cqw`;
};

export default function TempleEngravePreview({ className = "" }: { className?: string }) {
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [fontId, setFontId] = useState<(typeof FONTS)[number]["id"]>("bold");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoName, setLogoName] = useState("");
  const [demoIndex, setDemoIndex] = useState(0);
  const [revealKey, setRevealKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const font = FONTS.find((item) => item.id === fontId) ?? FONTS[0];
  const userText = text.trim();
  const hasDesign = Boolean(userText || logoUrl);
  const showDemo = !hasDesign && !editing;
  const shownText = showDemo ? DEMO_TEXTS[demoIndex] : userText || (editing && !logoUrl ? "TULISANMU" : "");
  const isPlaceholder = editing && !hasDesign;
  const logoOnly = Boolean(logoUrl) && !showDemo && !shownText;
  // The laser reveal plays for the demo loop and when a design is applied, never on each keystroke.
  const animateReveal = showDemo || (!editing && hasDesign);

  useEffect(() => {
    if (!showDemo) return;
    const timer = window.setInterval(() => setDemoIndex((value) => (value + 1) % DEMO_TEXTS.length), 3200);
    return () => window.clearInterval(timer);
  }, [showDemo]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finishEditing();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // finishEditing only touches setters; re-binding on every render is unnecessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const startEditing = (nextMode: Mode = mode) => {
    setMode(nextMode);
    setEditing(true);
    window.setTimeout(() => {
      if (window.innerWidth < 1024 && stageRef.current) {
        // Phones: keep the zoomed temple and the input on screen together, just under the sticky header.
        const top = stageRef.current.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: "smooth" });
      } else {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      if (nextMode === "text") inputRef.current?.focus({ preventScroll: true });
    }, 350);
  };

  const finishEditing = () => {
    setEditing(false);
    setRevealKey((value) => value + 1);
  };

  const resetDesign = () => {
    setText("");
    setLogoUrl("");
    setLogoName("");
    setFontId("bold");
  };

  const handleLogo = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format tidak didukung", { description: "Gunakan PNG, SVG, JPG, atau WEBP." });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("File terlalu besar", { description: "Maksimal ukuran logo adalah 2 MB." });
      return;
    }
    etchLogo(file)
      .then((url) => {
        setLogoUrl(url);
        setLogoName(file.name);
      })
      .catch(() => toast.error("Logo tidak bisa dibaca", { description: "Coba file PNG atau JPG lain." }));
  };

  const orderDesign = () => {
    saveCustomDraft({
      text: userText,
      fileName: logoName,
      fontLabel: font.label,
    });
  };

  const engravingKey = showDemo ? `demo-${demoIndex}` : `user-${revealKey}`;

  return (
    <div className={`flex flex-col ${className}`} data-testid="temple-engrave-preview">
      <div
        ref={stageRef}
        className="group relative aspect-square w-full overflow-hidden bg-white"
        style={{ containerType: "inline-size" }}
      >
        <button
          type="button"
          onClick={() => (editing ? inputRef.current?.focus() : startEditing("text"))}
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#c8102e]"
          aria-label="Custom tulisan atau logo di gagang kacamata"
          data-testid="temple-preview-stage"
        />
        <div
          className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none"
          style={{ transformOrigin: ZOOM_ORIGIN, transform: editing ? "scale(2)" : "scale(1)" }}
        >
          <img
            src={TEMPLE_IMAGE}
            alt="Tampak sisi luar gagang kacamata, area custom print"
            className={`h-full w-full object-cover transition duration-700 ${editing ? "" : "group-hover:scale-[1.02]"}`}
            data-testid="custom-banner-image"
          />
          {(shownText || logoUrl) && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: `${ANCHOR.x}%`,
                top: `${ANCHOR.y}%`,
                transform: `translate(-50%, -50%) rotate(${ANCHOR.angle}deg)${logoOnly ? ` translateX(${LOGO_ONLY_SHIFT})` : ""}`,
              }}
              aria-hidden="true"
            >
              <div key={engravingKey} className="relative">
                <div
                  className={`flex items-center gap-[0.8cqw] whitespace-nowrap leading-none ${animateReveal ? "engrave-reveal" : ""} ${isPlaceholder ? "opacity-45" : ""}`}
                  data-testid="temple-engraving"
                >
                  {logoUrl && !showDemo && (
                    <img
                      src={logoUrl}
                      alt=""
                      className={`w-auto object-contain ${logoOnly ? "h-[5.2cqw] max-w-[11cqw]" : "h-[4.2cqw] max-w-[7cqw]"}`}
                      style={{ filter: ETCHED_LOGO_FILTER }}
                    />
                  )}
                  {shownText && (
                    <span
                      className={font.className}
                      style={{
                        ...ETCHED_TEXT,
                        fontSize: fontSizeFor(shownText.length, Boolean(logoUrl) && !showDemo),
                      }}
                    >
                      {shownText}
                    </span>
                  )}
                </div>
                {animateReveal && (
                  <span
                    className="engrave-laser absolute top-1/2 h-[0.9cqw] w-[0.9cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                    style={{ boxShadow: "0 0 1.2cqw 0.5cqw rgba(255,90,60,.85), 0 0 0.4cqw rgba(255,255,255,1)" }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        {!editing && (
          <div
            className="engrave-float pointer-events-none absolute z-20 flex flex-col items-center"
            style={{ left: `${ANCHOR.x}%`, top: `calc(${ANCHOR.y}% - 15cqw)` }}
          >
            <span className="flex items-center gap-2 whitespace-nowrap bg-black px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-lg sm:text-[10px]">
              <Pencil size={12} /> {hasDesign ? "Ubah desainmu" : "Klik · custom tulisan / logo"}
            </span>
            <span className="h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-black" />
            <span className="relative mt-[3cqw] flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8102e] opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-[#c8102e]" />
            </span>
          </div>
        )}
        <span className="pointer-events-none absolute left-3 top-3 z-20 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black/60">
          {editing ? "Preview · area grafir gagang" : "SCOOT Custom Lab"}
        </span>
        {editing && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-20 bg-white/85 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-black/70">
            Ilustrasi · hasil akhir dikonfirmasi admin
          </span>
        )}
      </div>

      <div className="border-t border-black bg-[#f9f9f7]">
        {!editing && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
              {hasDesign ? (
                <>
                  Desainmu: <span className="text-[#c8102e]">{userText || logoName}</span>
                </>
              ) : (
                <>Grafir nama, inisial, atau logo kecil di gagang</>
              )}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEditing("text")}
                className="inline-flex items-center gap-2 bg-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#c8102e]"
                data-testid="temple-open-editor"
              >
                <Type size={13} /> {hasDesign ? "Ubah" : "Coba custom"}
              </button>
              {hasDesign && (
                <Link
                  to="/katalog/?custom=1"
                  onClick={orderDesign}
                  className="inline-flex items-center gap-2 border border-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-black hover:text-white"
                  data-testid="temple-order-link-collapsed"
                >
                  Pesan <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        )}

        <div
          ref={panelRef}
          className={`grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none ${editing ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          aria-hidden={!editing}
          inert={!editing}
        >
          <div className="overflow-hidden">
            <div className="space-y-5 px-4 py-5 sm:px-6" data-testid="temple-editor">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                  Custom gagang{" "}
                  <span className="text-[#c8102e]">+{formatPrice(CUSTOM_PRINT_PRICE)}/pcs</span>
                </p>
                <button
                  type="button"
                  onClick={finishEditing}
                  className="flex h-9 w-9 items-center justify-center border border-black/30 hover:border-black"
                  aria-label="Tutup editor"
                  data-testid="temple-close-editor"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 border border-black" role="tablist" aria-label="Jenis custom">
                {(
                  [
                    ["text", "Tulisan", Type],
                    ["logo", "Logo kecil", ImagePlus],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={mode === value}
                    onClick={() => setMode(value)}
                    className={`flex items-center justify-center gap-2 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${mode === value ? "bg-black text-white" : "hover:bg-black/5"}`}
                    data-testid={`temple-tab-${value}`}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>

              {mode === "text" ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
                      Tulisan di gagang
                      <span className="font-normal text-[#666]">
                        {text.length}/{MAX_CHARS}
                      </span>
                    </span>
                    <input
                      ref={inputRef}
                      value={text}
                      onChange={(event) => setText(event.target.value.slice(0, MAX_CHARS))}
                      maxLength={MAX_CHARS}
                      placeholder="Nama, inisial, atau frasa pendek"
                      className="mt-2 w-full border-b border-black bg-transparent py-3 text-base outline-none focus:border-[#c8102e]"
                      data-testid="temple-text-input"
                    />
                  </label>
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">Gaya huruf</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {FONTS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFontId(item.id)}
                          aria-pressed={fontId === item.id}
                          className={`border px-2 py-3 text-sm transition-colors ${fontId === item.id ? "border-black bg-black text-white" : "border-black/30 hover:border-black"}`}
                          data-testid={`temple-font-${item.id}`}
                        >
                          <span className={item.className}>Aa</span>
                          <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.1em] opacity-70">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">Logo kecil</p>
                  <div className="mt-2 flex items-stretch gap-2">
                    <label
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border border-dashed border-black/40 p-4 text-xs hover:border-[#c8102e]"
                      data-testid="temple-logo-dropzone"
                    >
                      <ImagePlus size={15} className="shrink-0" />
                      <span className="truncate">{logoName || "Pilih logo · PNG/SVG, maks. 2 MB"}</span>
                      <input
                        type="file"
                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(event) => {
                          handleLogo(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                        data-testid="temple-logo-input"
                      />
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUrl("");
                          setLogoName("");
                        }}
                        className="flex w-12 items-center justify-center border border-black/40 hover:border-[#c8102e] hover:text-[#c8102e]"
                        aria-label="Hapus logo"
                        data-testid="temple-logo-clear"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#666]">
                    Logo digrafir satu warna. PNG transparan atau SVG memberi hasil paling tajam. Bisa
                    digabung dengan tulisan.
                  </p>
                </div>
              )}

              <div className="border-l-2 border-[#c8102e] bg-white px-3 py-3" data-testid="temple-engrave-note">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">Warna grafir</p>
                <p className="mt-1 text-xs leading-relaxed text-[#666]">
                  Grafir dibuat dengan mengikis permukaan frame, jadi warna yang muncul adalah warna dasar
                  material frame. Warnanya mengikuti model &amp; warna frame yang kamu pilih, tidak bisa dipilih
                  terpisah.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-black/15 pt-5">
                <Link
                  to="/katalog/?custom=1"
                  onClick={orderDesign}
                  className={`inline-flex flex-1 items-center justify-center gap-2 bg-black px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#c8102e] ${hasDesign ? "" : "pointer-events-none opacity-40"}`}
                  aria-disabled={!hasDesign}
                  tabIndex={hasDesign ? undefined : -1}
                  data-testid="temple-order-link"
                >
                  Pilih model dengan desain ini <ArrowRight size={13} />
                </Link>
                <button
                  type="button"
                  onClick={finishEditing}
                  className="border border-black px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-black hover:text-white"
                  data-testid="temple-done-button"
                >
                  Selesai
                </button>
                {hasDesign && (
                  <button
                    type="button"
                    onClick={resetDesign}
                    className="flex h-[46px] w-[46px] items-center justify-center border border-black/30 hover:border-[#c8102e] hover:text-[#c8102e]"
                    aria-label="Reset desain"
                    data-testid="temple-reset-button"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
