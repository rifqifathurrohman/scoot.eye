import { Menu, MessageCircle, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCartCount } from "@/lib/cart";
import BrandMark from "@/components/BrandMark";
import { formatPrice, isOpeningPromo, OPENING_PROMO_LABEL, priceOf, products } from "@/lib/catalog";

const navItems = [
	{ label: "Katalog", to: "/katalog/" },
	{ label: "Custom Print", to: "/custom-print/" },
	{ label: "Panduan", to: "/panduan-produk/" },
	{ label: "Our Story", to: "/tentang-kami/" },
	{ label: "Grosir", to: "/grosir/" },
	{ label: "Kontak", to: "/kontak/" },
];

export default function SiteHeader() {
	const [open, setOpen] = useState(false);
	const count = useCartCount();
	return (
		<>
			<div
				className="border-b border-black bg-black px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white sm:px-8"
				data-testid="announcement-bar"
			>
				<div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
					{isOpeningPromo() ? (
						<Link to="/katalog/" className="truncate hover:underline" data-testid="announcement-copy">
							<span className="mr-2 bg-[#c8102e] px-1.5 py-0.5">Opening</span>
							Mulai {formatPrice(Math.min(...products.map((item) => priceOf(item))))}{" "}
							<span className="hidden sm:inline">· harga spesial </span>
							{OPENING_PROMO_LABEL}
						</Link>
					) : (
						<span className="truncate" data-testid="announcement-copy">
							<span className="hidden sm:inline">Welcome to SCOOT Eyewear — </span>
							Ride Your Own Style.
						</span>
					)}
					<a
						className="hidden items-center gap-1 underline underline-offset-4 sm:flex"
						href="https://wa.me/6285156581959"
						target="_blank"
						rel="noreferrer"
						data-testid="header-support-link"
					>
						<MessageCircle size={12} /> WhatsApp support ↗
					</a>
				</div>
			</div>
			<header
				className="sticky top-0 z-40 border-b border-black/10 bg-[#f9f9f7]/90 backdrop-blur-md"
				data-testid="site-header"
			>
				<div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
					<Link
						to="/"
						className="group flex items-center gap-3"
						onClick={() => setOpen(false)}
						data-testid="brand-home-link"
					>
						<BrandMark compact className="max-w-[150px] sm:max-w-[190px]" />
					</Link>
					<nav
						className="hidden items-center gap-5 lg:flex"
						aria-label="Primary navigation"
						data-testid="desktop-navigation"
					>
						{navItems.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									`font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors hover:text-[#c8102e] ${
										isActive ? "text-[#c8102e]" : "text-black"
									}`
								}
								data-testid={`nav-link-${item.label
									.toLowerCase()
									.replaceAll(" ", "-")}`}
							>
								{item.label}
							</NavLink>
						))}
					</nav>
					<div className="flex items-center gap-2">
						<Link
							to="/keranjang/"
							className="relative inline-flex h-10 items-center gap-2 border border-black px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-all hover:bg-black hover:text-white"
							aria-label={`Keranjang, ${count} produk`}
							data-testid="cart-navigation-link"
						>
							<ShoppingBag size={15} />{" "}
							<span className="hidden sm:inline">Cart</span>
							<span
								className="text-[#c8102e]"
								data-testid="cart-item-count"
							>
								({count})
							</span>
						</Link>
						<button
							type="button"
							className="inline-flex h-10 w-10 items-center justify-center border border-black lg:hidden"
							onClick={() => setOpen((value) => !value)}
							aria-label={open ? "Tutup menu" : "Buka menu"}
							aria-expanded={open}
							aria-controls="mobile-navigation"
							data-testid="mobile-menu-toggle"
						>
							{open ? <X size={18} /> : <Menu size={18} />}
						</button>
					</div>
				</div>
				{open && (
					<nav
						id="mobile-navigation"
						className="border-t border-black/10 bg-[#f9f9f7] px-4 py-5 lg:hidden"
						aria-label="Mobile navigation"
						data-testid="mobile-navigation"
					>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{navItems.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									onClick={() => setOpen(false)}
									className={({ isActive }) =>
										`border px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
											isActive
												? "border-black bg-black text-white"
												: "border-black hover:bg-black hover:text-white"
										}`
									}
									data-testid={`mobile-nav-link-${item.label
										.toLowerCase()
										.replaceAll(" ", "-")}`}
								>
									{item.label}
								</NavLink>
							))}
						</div>
					</nav>
				)}
			</header>
		</>
	);
}