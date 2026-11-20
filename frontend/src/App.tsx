import { lazy, Suspense, useEffect } from "react";
import { track, trackOutboundClick } from "@/lib/track";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import CustomPrint from "@/pages/CustomPrint";
import ProductGuide from "@/pages/ProductGuide";
import About from "@/pages/About";
import Wholesale from "@/pages/Wholesale";
import Contact from "@/pages/Contact";
import Cart from "@/pages/Cart";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { loadRemoteCatalog, useCatalogVersion } from "@/lib/catalogRemote";

// The backoffice is loaded only when someone opens /admin, so shoppers never download it.
const Admin = lazy(() => import("@/pages/Admin"));

// SPA navigation keeps the previous scroll position by default; start each new page at the top.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    track("page_view");
  }, [pathname]);
  return null;
}

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  // Re-render the whole tree once live prices/stock/promo are merged into the catalog.
  useCatalogVersion();
  useEffect(() => {
    void loadRemoteCatalog();
    // Shopee / WhatsApp / Instagram links anywhere on the site are counted from one listener.
    document.addEventListener("click", trackOutboundClick, true);
    return () => document.removeEventListener("click", trackOutboundClick, true);
  }, []);
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/katalog/*" element={<Catalog />} />
        <Route path="/produk/:id/*" element={<ProductDetail />} />
        <Route path="/custom-print/*" element={<CustomPrint />} />
        <Route path="/panduan-produk/*" element={<ProductGuide />} />
        <Route path="/tentang-kami/*" element={<About />} />
        <Route path="/grosir/*" element={<Wholesale />} />
        <Route path="/kontak/*" element={<Contact />} />
        <Route path="/keranjang/*" element={<Cart />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="p-10 font-mono text-xs">Memuat backoffice…</div>}>
              <Admin />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}
