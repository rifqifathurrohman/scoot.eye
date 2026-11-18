import { ArrowUpRight, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "@/components/BrandMark";

export default function SiteFooter() {
  return (
    <footer className="border-t border-black bg-black px-4 pb-8 pt-14 text-white sm:px-8 lg:px-12" data-testid="site-footer">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60" data-testid="footer-eyebrow">SCOOT / 01—09</p>
            <div className="mb-6 mt-4 inline-flex rounded-sm bg-white px-3 py-2">
              <BrandMark to="" compact />
            </div>
            <h2 className="mt-5 max-w-xl font-heading text-5xl font-bold uppercase leading-[0.88] tracking-[-0.08em] sm:text-7xl" data-testid="footer-heading">Ride your own style.</h2>
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
            <a className="mt-3 flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] hover:text-[#ff4b4b]" href="https://instagram.com" target="_blank" rel="noreferrer" data-testid="footer-instagram-link"><Instagram size={14} /> Instagram ↗</a>
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