import { supabase } from "@/lib/supabase";

// First-party analytics for the backoffice (table public.events, see supabase/migrations/003).
// Stores no personal data: a random per-browser id (for unique visitors), the page path, an
// optional product id, the traffic source host and mobile/desktop. Fire-and-forget: tracking
// never blocks or breaks the shop.

export type TrackEvent =
  | "page_view"
  | "shopee_click"
  | "whatsapp_click"
  | "instagram_click"
  | "add_to_cart"
  | "checkout"
  | "custom_design";

const VISITOR_KEY = "scoot-visitor";
const SOURCE_KEY = "scoot-source";

const enabled = () =>
  typeof window !== "undefined" &&
  !navigator.webdriver &&
  !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) &&
  !window.location.pathname.startsWith("/admin");

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
      );

function visitorId() {
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = uuid();
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

/** Where this visit came from: ?utm_source=…, else the referring site's host, kept for the session. */
function trafficSource() {
  try {
    const stored = window.sessionStorage.getItem(SOURCE_KEY);
    if (stored !== null) return stored || null;
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    let source = utm?.trim().toLowerCase().slice(0, 80) || "";
    if (!source && document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host && host !== window.location.hostname) source = host.slice(0, 80);
    }
    window.sessionStorage.setItem(SOURCE_KEY, source);
    return source || null;
  } catch {
    return null;
  }
}

/** Product id from /produk/<id>/… when the event happens on a product page. */
const productFromPath = (path: string) => path.match(/^\/produk\/([^/?#]+)/)?.[1] ?? null;

export function track(type: TrackEvent, productId?: string | null) {
  if (!enabled()) return;
  const path = window.location.pathname.slice(0, 200) || "/";
  void supabase
    .from("events")
    .insert({
      type,
      path,
      product_id: (productId ?? productFromPath(path))?.slice(0, 40) ?? null,
      visitor_id: visitorId(),
      source: trafficSource(),
      device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
    })
    .then(({ error }) => {
      if (error) console.debug("track skipped", error.message);
    });
}

/** Classify an outbound link click (Shopee / WhatsApp / Instagram) from anywhere on the site. */
export function trackOutboundClick(event: MouseEvent) {
  const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!anchor) return;
  const href = anchor.href;
  if (/shopee\.co\.id/.test(href)) track("shopee_click");
  else if (/wa\.me|whatsapp\.com/.test(href)) track("whatsapp_click");
  else if (/instagram\.com/.test(href)) track("instagram_click");
}
