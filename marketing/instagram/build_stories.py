"""Render Instagram Stories (1080x1920) and Highlight covers for the SCOOT launch.

usage (from repo root): python marketing/instagram/build_stories.py
Reuses the feed design system in build_posts.py. Writes HTML to marketing/instagram/html/ and
PNG to marketing/instagram/export/stories/ and marketing/instagram/export/highlights/.

Safe zone: Instagram overlays the profile row at the top (~0-250px) and the reply bar at the
bottom (~1650-1920px), so text and key visuals stay between y=260 and y=1620.
"""
import subprocess

import build_posts as bp

OUT_STORY = bp.ROOT / "marketing/instagram/export/stories"
OUT_HL = bp.ROOT / "marketing/instagram/export/highlights"
SITE = {
    "home": bp.uri("marketing/instagram/assets/site/home.png"),
    "product": bp.uri("marketing/instagram/assets/site/product.png"),
}
URL = "scooteyewear.my.id"

STORY_CSS = """
html, body { height: 1920px; }
.frame { height: 1920px; }
.phone { position: absolute; background: #0b0b0b; border-radius: 74px; padding: 18px; box-shadow: 0 60px 90px -30px rgba(0,0,0,.55), inset 0 0 0 2px #333; }
.phone img { display: block; width: 100%; border-radius: 58px; }
.phone::before { content: ''; position: absolute; left: 50%; top: 34px; width: 130px; height: 34px; transform: translateX(-50%); background: #0b0b0b; border-radius: 20px; z-index: 2; }
.url { display: inline-flex; align-items: center; gap: 18px; background: #111; color: #fff; font-family: 'Mono'; font-weight: 700; font-size: 38px; letter-spacing: .04em; padding: 24px 38px; border-radius: 18px; }
.url .dot { width: 18px; height: 18px; border-radius: 50%; background: #2fbf4a; box-shadow: 0 0 0 6px rgba(47,191,74,.25); }
"""


def story(body: str) -> str:
    html = bp.page(body)
    return html.replace("</style>", STORY_CSS + "</style>", 1).replace("<div class='bar'>", "<div class='bar' style='display:none'>", 1)


def logo(top: int = 270, center: bool = False) -> str:
    return f"<img class='logo{' center' if center else ''}' src='{bp.LOGO}' style='top:{top}px'>"


# ---------------- Stories ----------------
def s1_live():
    return story(f"""
{logo()}
<div class='abs small' style='right:54px;top:280px'>Belisima Series</div>
{bp.img('a-brill/brill-tp', 330, 380, 820, -10, 12)}
{bp.img('a-brill/brill-bl', -90, 700, 820, 10, 14)}
{bp.img('a-brill/brill-ld', 520, 940, 640, -14, 13)}
{bp.badge('Now<br>live', 70, 420, 230, -14, 52)}
<div class='abs center' style='left:0;right:0;top:1260px'>
  <div style='font-family:Inter;font-weight:500;font-size:68px;letter-spacing:-0.035em'>SCOOT Eyewear is</div>
  <div class='serif' style='font-size:190px;margin-top:4px'>officially live</div>
  <div class='small' style='margin-top:34px;font-size:26px;letter-spacing:.16em'>9 model · custom grafir · {URL}</div>
</div>""")


def s2_website():
    return story(f"""
{logo(top=270, center=True)}
<div class='abs center' style='left:0;right:0;top:350px'>
  <div class='sans' style='font-size:150px'>Website</div>
  <div class='serif' style='font-size:120px;color:#c0141f;margin-top:-6px'>is now live</div>
</div>
<div class='abs small center' style='left:0;right:0;top:600px;font-size:24px;letter-spacing:.14em'>Katalog lengkap · preview custom · checkout via WA</div>
<div class='phone' style='left:320px;top:670px;width:440px;transform:rotate(-3deg)'><img src='{SITE['home']}'></div>
<div class='abs center' style='left:0;right:0;top:1520px;z-index:30'>
  <div class='url'><span class='dot'></span>{URL}</div>
</div>""")


def s3_promo():
    return story(f"""
{logo()}
<div class='abs small' style='right:54px;top:280px'>Opening promo</div>
<div class='abs center' style='left:0;right:0;top:400px'>
  <div class='serif' style='font-size:120px'>Harga opening</div>
  <div class='sans' style='font-size:420px;line-height:.8;color:{bp.MAROON};margin-top:30px;letter-spacing:-0.06em'>100<span style='font-size:.42em;letter-spacing:-0.03em'>rb</span></div>
  <div style='font-family:Inter;font-weight:600;font-size:56px;margin-top:26px'><s style='color:#888;text-decoration-color:{bp.MAROON};text-decoration-thickness:5px'>Rp120–140rb</s> &nbsp;→&nbsp; Rp100.000</div>
  <div class='small' style='margin-top:20px;font-size:26px;letter-spacing:.12em'>Casama Rp110.000 (normal Rp130.000)</div>
</div>
{bp.img('b-ocala/ocala-ld', -40, 1090, 620, 12, 12)}
{bp.img('h-satvale/satvale-bb', 500, 1150, 620, -10, 13)}
<div class='abs center' style='left:0;right:0;top:1470px;z-index:30'>
  <div class='pill' style='font-size:30px;padding:24px 54px'>Berlaku s/d Minggu, 29 Nov</div>
</div>""")


def s4_custom():
    return story(f"""
<div class='abs center caps' style='left:0;right:0;top:290px'>SCOOT custom lab</div>
<div class='abs center serif-up' style='left:0;right:0;top:350px;font-size:150px;color:#c0141f;line-height:1'>Make it<br><span class='serif' style='font-weight:700'>yours</span></div>
<div class='abs card' style='left:70px;top:720px;width:940px;height:620px'>{bp.engraved_temple('NAMAMU DI SINI', 1.6, 'etched', 1.95, 940, 620)}</div>
{bp.badge('+Rp<br>15rb', 820, 640, 200, 10, 44)}
<div class='abs center' style='left:80px;right:80px;top:1390px'>
  <div class='copy' style='font-size:38px'>Grafir nama, inisial, atau logo kecil di gagang kacamatamu.</div>
  <div class='small' style='margin-top:26px;font-size:24px;letter-spacing:.12em'>Coba preview langsung di {URL}</div>
</div>""")


def s5_favorite():
    picks = [("A", "Brill", "a-brill/brill-bl"), ("B", "Ocala", "b-ocala/ocala-ld"),
             ("C", "Kurera", "f-kurera/kukera-br"), ("D", "Satvale", "h-satvale/satvale-bb")]
    cards = "".join(
        f"<div class='card' style='position:relative;height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;overflow:visible'>"
        f"<span style='position:absolute;left:24px;top:22px;width:62px;height:62px;border-radius:50%;background:{bp.MAROON};color:#fff;font:800 34px Inter;display:flex;align-items:center;justify-content:center'>{k}</span>"
        f"<img src='{bp.cut(p)}' style='width:380px;filter:drop-shadow(0 22px 16px rgba(0,0,0,.25))'>"
        f"<span class='sans' style='font-size:48px'>{n}</span></div>"
        for k, n, p in picks)
    return story(f"""
<div class='abs center caps' style='left:0;right:0;top:290px'>The current product</div>
<div class='abs center serif-up' style='left:0;right:0;top:350px;font-size:150px;color:#c0141f'>Pick your <span class='serif' style='font-weight:700'>style</span></div>
<div class='abs' style='left:60px;right:60px;top:600px;display:grid;grid-template-columns:1fr 1fr;gap:30px'>{cards}</div>
<div class='abs center' style='left:0;right:0;top:1520px'>
  <div class='copy' style='font-size:40px'>Mana favoritmu? Balas <b>A, B, C,</b> atau <b>D</b> 👇</div>
</div>""")


def s6_order():
    steps = [("01", f"Buka {URL}"), ("02", "Pilih model & warna"), ("03", "Tambah grafir (opsional)"), ("04", "Checkout via WhatsApp")]
    rows = "".join(
        f"<div style='display:flex;align-items:center;gap:22px;padding:24px 0;border-top:2px solid #222'>"
        f"<span style='font-family:Mono;font-weight:700;font-size:30px;color:{bp.MAROON}'>{n}</span>"
        f"<span class='sans' style='font-size:40px;letter-spacing:-0.03em;line-height:1.05'>{t}</span></div>"
        for n, t in steps)
    return story(f"""
{logo()}
<div class='abs' style='left:60px;top:390px;display:flex;gap:22px;align-items:baseline'>
  <span class='thin' style='font-size:118px'>How</span><span class='sans' style='font-size:118px'>to order</span>
</div>
<div class='abs' style='left:60px;top:620px;width:500px'>{rows}<div style='border-top:2px solid #222'></div>
  <div class='copy' style='font-size:28px;margin-top:30px'>Ongkir & pembayaran dikonfirmasi admin. Harga opening s/d 29 Nov.</div>
</div>
<div class='phone' style='left:600px;top:600px;width:430px;transform:rotate(4deg)'><img src='{SITE['product']}'></div>
<div class='abs center' style='left:0;right:0;top:1500px;z-index:30'><div class='url'><span class='dot'></span>{URL}</div></div>""")


STORIES = {
    "s1-officially-live": s1_live,
    "s2-website-live": s2_website,
    "s3-opening-price": s3_promo,
    "s4-custom-grafir": s4_custom,
    "s5-pick-your-style": s5_favorite,
    "s6-how-to-order": s6_order,
}

# ---------------- Highlight covers ----------------
ICONS = {
    "opening": "<path d='M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z'/><path d='M20 2v4'/><path d='M22 4h-4'/><circle cx='4' cy='20' r='2'/>",
    "website": "<circle cx='12' cy='12' r='10'/><path d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'/><path d='M2 12h20'/>",
    "katalog": "<circle cx='6' cy='15' r='4'/><circle cx='18' cy='15' r='4'/><path d='M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2'/><path d='M2.5 13 5 7c.7-1.3 1.4-2 3-2'/><path d='M21.5 13 19 7c-.7-1.3-1.5-2-3-2'/>",
    "custom": "<path d='M13 21h8'/><path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/>",
    "order": "<path d='M16 10a4 4 0 0 1-8 0'/><path d='M3.103 6.034h17.794'/><path d='M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z'/>",
}


def highlight(icon: str) -> str:
    # Instagram crops the centre of the cover into a circle, so the icon sits dead-centre.
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>*{{margin:0}}html,body{{width:1080px;height:1920px;overflow:hidden;"
            f"background:radial-gradient(circle at 50% 50%,#2a2a2a 0%,#141414 55%,#0a0a0a 100%)}}"
            f".ring{{position:absolute;left:50%;top:50%;width:760px;height:760px;transform:translate(-50%,-50%);border-radius:50%;border:6px solid rgba(255,255,255,.14)}}"
            f".dot{{position:absolute;left:calc(50% + 230px);top:calc(50% - 250px);width:46px;height:46px;border-radius:50%;background:{bp.MAROON};box-shadow:0 0 0 10px rgba(142,27,31,.25)}}"
            f"svg{{position:absolute;left:50%;top:50%;width:400px;height:400px;transform:translate(-50%,-50%)}}</style></head><body>"
            f"<div class='ring'></div><div class='dot'></div>"
            f"<svg viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'>{ICONS[icon]}</svg>"
            f"</body></html>")


def render(html: str, name: str, out_dir, width=1080, height=1920):
    out_dir.mkdir(parents=True, exist_ok=True)
    src = bp.OUT_HTML / f"{name}.html"
    src.parent.mkdir(parents=True, exist_ok=True)
    src.write_text(html, encoding="utf-8")
    png = out_dir / f"{name}.png"
    subprocess.run([str(bp.CHROME), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
                    "--force-device-scale-factor=1", f"--window-size={width},{height}", "--virtual-time-budget=6000",
                    f"--screenshot={png}", src.as_uri()], check=True, capture_output=True, timeout=120)
    print("rendered", png.relative_to(bp.ROOT))


def main():
    for name, build in STORIES.items():
        render(build(), name, OUT_STORY)
    for icon in ICONS:
        render(highlight(icon), f"hl-{icon}", OUT_HL)


if __name__ == "__main__":
    main()
