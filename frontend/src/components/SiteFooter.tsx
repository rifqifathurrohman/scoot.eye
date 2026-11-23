import { ArrowUpRight, Instagram, MessageCircle, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { SiShopee } from "@icons-pack/react-simple-icons";
import BrandMark from "@/components/BrandMark";
import { SHOPEE_STORE_URL, TOKOPEDIA_STORE_URL } from "@/lib/catalog";

export default function SiteFooter() {
  return (
    <footer className="border-t border-black bg-black px-4 pb-8 pt-14 text-white sm:px-8 lg:px-12" data-testid="site-footer">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <h2 className="max-w-xl font-heading text-5xl font-bold uppercase leading-[0.88] tracking-[-0.08em] sm:text-7xl" data-testid="footer-heading">Ride your own style.</h2>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60" data-testid="footer-explore-label">Explore</p>
            <div className="mt-5 grid gap-3">
              <Link className="w-fit font-mono text-xs uppercase tracking-[0.1em] hover:text-[#ff4b4b]" to="/katalog/" data-testid="footer-catalog-link">Katalog ↗</Link>
              <Link className="w-fit font-mono text-xs uppercase tracking-[0.1em] hover:text-[#ff4b4b]" to="/custom-print/" data-testid="footer-custom-link">Custom Print ↗</Link>
              <Link className="w-fit font-mono text-xs uppercase tracking-[0.1em] hover:text-[#ff4b4b]" to="/tentang-kami/" data-testid="footer-story-link">Our Story ↗</Link>
              <Link className="w-fit font-mono text-xs uppercase tracking-[0.1em] hover:text-[#ff4b4b]" to="/keranjang/" data-testid="footer-cart-link">Keranjang ↗</Link>
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60" data-testid="footer-contact-label">Stay in touch</p>
            <a className="mt-5 flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-[#ff4b4b]" href="https://wa.me/6285156581959" target="_blank" rel="noreferrer" data-testid="footer-whatsapp-link"><MessageCircle size={14} /> WhatsApp ↗</a>
            <a className="mt-3 flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-[#ff4b4b]" href="https://www.instagram.com/scoot.eyewear/" target="_blank" rel="noreferrer" aria-label="Instagram SCOOT Eyewear (@scoot.eyewear)" data-testid="footer-instagram-link"><Instagram size={14} /> @scoot.eyewear ↗</a>
            <a className="mt-3 flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-[#ff4b4b]" href={SHOPEE_STORE_URL} target="_blank" rel="noreferrer" aria-label="Toko Shopee SCOOT Eyewear" data-testid="footer-shopee-link"><SiShopee size={14} /> Shopee ↗</a>
            <a className="mt-3 flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-[#ff4b4b]" href={TOKOPEDIA_STORE_URL} target="_blank" rel="noreferrer" aria-label="Toko Tokopedia SCOOT Eyewear" data-testid="footer-tokopedia-link"><Store size={14} /> Tokopedia ↗</a>
            <div className="mt-8 inline-flex rounded-sm bg-white px-3 py-2" data-testid="footer-brand-mark">
              <BrandMark to="" compact />
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/20 pt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/50 sm:flex-row" data-testid="footer-bottom">
          <span data-testid="footer-copyright">© {new Date().getFullYear()} SCOOT Eyewear. All rights reserved.</span>
          <span className="flex items-center gap-1" data-testid="footer-manifesto">Independent / Timeless / Custom <ArrowUpRight size={12} /></span>
        </div>
      </div>
    </footer>
  );
}