import { useEffect } from "react";
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

// SPA navigation keeps the previous scroll position by default; start each new page at the top.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}
