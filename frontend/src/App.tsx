import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import CustomPrint from "@/pages/CustomPrint";
import ProductGuide from "@/pages/ProductGuide";
import About from "@/pages/About";
import Wholesale from "@/pages/Wholesale";
import Contact from "@/pages/Contact";
import Cart from "@/pages/Cart";
import { Toaster } from "@/components/ui/sonner";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <><Routes><Route path="/" element={<Home />} /><Route path="/katalog/*" element={<Catalog />} /><Route path="/produk/:id/*" element={<ProductDetail />} /><Route path="/custom-print/*" element={<CustomPrint />} /><Route path="/panduan-produk/*" element={<ProductGuide />} /><Route path="/tentang-kami/*" element={<About />} /><Route path="/grosir/*" element={<Wholesale />} /><Route path="/kontak/*" element={<Contact />} /><Route path="/keranjang/*" element={<Cart />} /></Routes><Toaster /></>
  );
}
