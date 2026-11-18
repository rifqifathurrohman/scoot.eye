"""Render the SCOOT Eyewear launch posts (1080x1350, Instagram 4:5).

Visual language follows the brand's Canva concept: grey paper background, black welcome bar,
large angled product cut-outs with soft shadows, heavy grotesk + italic serif type, maroon accents.

usage (from repo root):
  python marketing/instagram/make_cutouts.py   # once, or after product photos change
  python marketing/instagram/build_posts.py
Writes HTML to marketing/instagram/html/ and PNG to marketing/instagram/export/.
Needs Google Chrome and the frontend's node_modules (fonts).
"""
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_HTML = ROOT / "marketing/instagram/html"
OUT_PNG = ROOT / "marketing/instagram/export"
CHROME = Path("C:/Program Files/Google/Chrome/Application/chrome.exe")


def uri(path: str) -> str:
    return (ROOT / path).as_uri()


def cut(name: str) -> str:
    return uri(f"marketing/instagram/assets/cutouts/{name}.png")


FONT = "frontend/node_modules/@fontsource-variable"
LOGO = uri("frontend/public/scoot-eyewear-wordmark-dark.png")
PHOTO = {
    "maroon": uri("marketing/instagram/assets/campaign-maroon_2b77d7cf.webp"),
    "red": uri("marketing/instagram/assets/campaign-red-frame_ae537b5b.webp"),
}
TEMPLE = uri("marketing/instagram/assets/temple-brill.webp")
MAROON = "#8e1b1f"
NOISE = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>"
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/>"
    "<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter>"
    "<rect width='100%25' height='100%25' filter='url(%23n)'/></svg>"
)

CSS = f"""
@font-face {{ font-family: 'Inter'; src: url('{uri(FONT + "/inter/files/inter-latin-wght-normal.woff2")}') format('woff2'); font-weight: 100 900; }}
@font-face {{ font-family: 'Mono'; src: url('{uri(FONT + "/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2")}') format('woff2'); font-weight: 100 800; }}
@font-face {{ font-family: 'Serif'; src: url('{uri(FONT + "/playfair-display/files/playfair-display-latin-wght-normal.woff2")}') format('woff2'); font-weight: 400 900; }}
@font-face {{ font-family: 'Serif'; src: url('{uri(FONT + "/playfair-display/files/playfair-display-latin-wght-italic.woff2")}') format('woff2'); font-style: italic; font-weight: 400 900; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ width: 1080px; height: 1350px; overflow: hidden; }}
body {{ font-family: 'Inter', sans-serif; color: #111; -webkit-font-smoothing: antialiased; }}
.frame {{ position: relative; width: 1080px; height: 1350px; overflow: hidden;
  background: radial-gradient(ellipse 85% 70% at 50% 42%, #f3f3f1 0%, #e4e4e2 62%, #d3d3d1 100%); }}
.frame::after {{ content: ''; position: absolute; inset: 0; background-image: url("{NOISE}"); opacity: .22; mix-blend-mode: multiply; pointer-events: none; z-index: 50; }}
.bar {{ position: absolute; left: 0; right: 0; top: 0; height: 58px; background: #1d1d1d; color: #e9e9e9; display: flex; align-items: center; justify-content: center; z-index: 40;
  font-family: 'Mono'; font-size: 15px; font-weight: 600; letter-spacing: .26em; text-transform: uppercase; }}
.bar .flag {{ position: absolute; left: 52px; top: 20px; width: 30px; height: 18px; border: 2px solid #e9e9e9; display: flex; gap: 3px; padding: 2px; }}
.bar .flag i {{ flex: 1; background: {MAROON}; }} .bar .flag i:nth-child(2) {{ background: #e9e9e9; }}
.logo {{ position: absolute; left: 54px; top: 104px; height: 44px; z-index: 30; }}
.logo.center {{ left: 50%; transform: translateX(-50%); }}
.logo.inv {{ filter: invert(1); }}
.abs {{ position: absolute; }}
.cut {{ position: absolute; filter: drop-shadow(0 38px 30px rgba(0,0,0,.26)) drop-shadow(0 6px 8px rgba(0,0,0,.18)); }}
.sans {{ font-family: 'Inter'; font-weight: 800; text-transform: uppercase; letter-spacing: -0.045em; line-height: .9; }}
.thin {{ font-family: 'Inter'; font-weight: 300; text-transform: uppercase; letter-spacing: -0.03em; line-height: .9; }}
.serif {{ font-family: 'Serif'; font-style: italic; font-weight: 600; letter-spacing: -0.025em; line-height: .95; }}
.serif-up {{ font-family: 'Serif'; font-weight: 700; letter-spacing: -0.045em; line-height: .9; }}
.caps {{ font-family: 'Inter'; font-weight: 500; text-transform: uppercase; letter-spacing: .26em; font-size: 26px; }}
.small {{ font-family: 'Inter'; font-weight: 600; text-transform: uppercase; font-size: 22px; line-height: 1.25; letter-spacing: .01em; }}
.copy {{ font-family: 'Inter'; font-weight: 500; font-size: 30px; line-height: 1.35; }}
.pill {{ display: inline-block; background: {MAROON}; color: #fff; font-family: 'Inter'; font-weight: 700; font-size: 24px; letter-spacing: .04em; text-transform: uppercase; padding: 20px 46px; border-radius: 12px; }}
.center {{ text-align: center; }}
.card {{ background: rgba(255,255,255,.92); border-radius: 30px; box-shadow: 0 30px 60px -20px rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,255,255,.9); overflow: hidden; }}
.table {{ display: grid; grid-template-columns: 1fr 1fr; border: 2px solid #222; }}
.table > div {{ display: flex; align-items: center; gap: 26px; padding: 20px 24px; border-right: 2px solid #222; border-bottom: 2px solid #222; }}
.table > div:nth-child(2n) {{ border-right: 0; }} .table > div:nth-last-child(-n+2) {{ border-bottom: 0; }}
.table .k {{ font-size: 17px; font-weight: 600; text-transform: uppercase; line-height: 1.1; width: 110px; }}
.table .v {{ font-size: 30px; font-weight: 500; text-transform: uppercase; letter-spacing: -0.01em; }}
.bw {{ filter: grayscale(1) contrast(1.08); }}
"""


def page(body: str) -> str:
    bar = "<div class='bar'><span class='flag'><i></i><i></i><i></i></span>Welcome to SCOOT Eyewear — Ride your own style.</div>"
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body><div class='frame'>{bar}{body}</div></body></html>"


def badge(text: str, x: int, y: int, size: int = 190, rotate: int = -12, font: int = 40) -> str:
    pts = []
    for i in range(36):
        r = 50 if i % 2 == 0 else 45
        a = math.pi * 2 * i / 36
        pts.append(f"{50 + r * math.cos(a):.2f},{50 + r * math.sin(a):.2f}")
    return (f"<div class='abs' style='left:{x}px;top:{y}px;width:{size}px;height:{size}px;transform:rotate({rotate}deg);z-index:35;filter:drop-shadow(0 14px 18px rgba(0,0,0,.25))'>"
            f"<svg viewBox='0 0 100 100' style='position:absolute;inset:0'><polygon points='{' '.join(pts)}' fill='{MAROON}'/></svg>"
            f"<div style='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;font-family:Inter;font-weight:800;text-transform:uppercase;font-size:{font}px;line-height:.92;letter-spacing:-0.03em'>{text}</div></div>")


def img(name: str, x: int, y: int, w: int, rotate: float = 0, z: int = 10) -> str:
    return f"<img class='cut' src='{cut(name)}' style='left:{x}px;top:{y}px;width:{w}px;transform:rotate({rotate}deg);z-index:{z}'>"


def engraved_temple(text: str, size: float, finish: str, zoom: float, window_w: int, window_h: int) -> str:
    style = {
        "gold": "background:linear-gradient(180deg,#fff3b8 0%,#e4bb52 48%,#9a6a1c 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 1px 1px rgba(0,0,0,.55));",
        "white": "color:#fafafa;text-shadow:0 1px 1px rgba(0,0,0,.6);",
    }[finish]
    return f"""
<div style='position:relative;width:{window_w}px;height:{window_h}px;overflow:hidden;background:#fff'>
 <div style='position:absolute;left:0;width:{window_w}px;height:{window_w}px;top:{-(window_w - window_h) // 2}px;container-type:inline-size'>
  <div style='position:absolute;inset:0;transform:scale({zoom});transform-origin:80% 50%'>
   <img src='{TEMPLE}' style='width:100%;height:100%;object-fit:cover'>
   <div style='position:absolute;left:68.75%;top:50.5%;transform:translate(-50%,-50%) rotate(-15deg);white-space:nowrap;line-height:1;font-family:Inter;font-weight:800;text-transform:uppercase;letter-spacing:.14em;font-size:{size}cqw;{style}'>{text}</div>
  </div>
 </div>
</div>"""


# ---------------- 01 · Launch carousel ----------------
def launch_cover():
    return page(f"""
<img class='logo' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px'>Belisima Series</div>
{img('a-brill/brill-tp', 380, 190, 720, -8, 12)}
{img('a-brill/brill-bl', -40, 470, 700, 9, 14)}
{img('a-brill/brill-ld', 610, 610, 560, -14, 13)}
{badge('Now<br>live', 70, 260, 200, -14, 46)}
<div class='abs center' style='left:0;right:0;top:960px'>
  <div style='font-family:Inter;font-weight:500;font-size:62px;letter-spacing:-0.035em'>officially launching</div>
  <div class='serif' style='font-size:114px;margin-top:6px'>Ride Your Own Style</div>
  <div class='pill' style='margin-top:40px'>Shop now</div>
</div>""")


def launch_story():
    return page(f"""
<div class='abs' style='left:0;top:58px;width:1080px;height:800px;overflow:hidden'>
  <img class='bw' src='{PHOTO['maroon']}' style='width:100%;height:100%;object-fit:cover;object-position:54% 28%'>
  <div class='abs' style='inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25),transparent 30%,transparent 70%,rgba(0,0,0,.35))'></div>
</div>
<img class='logo inv' src='{LOGO}'>
<div class='abs small' style='left:54px;top:800px;color:#fff'>SCOOT Eyewear</div>
<div class='abs small' style='right:54px;top:800px;color:#fff'>Shop now</div>
<div class='abs' style='left:0;top:858px;width:1080px;height:492px;background:#cdd2d6'></div>
<div class='abs' style='left:54px;top:910px;width:430px;z-index:30'>
  <div class='small' style='font-size:34px;font-weight:600;line-height:1.15'>Not just another pair of sunglasses.</div>
  <div class='copy' style='font-size:24px;margin-top:26px;color:#333'>Terinspirasi kultur skuter vintage, streetwear independen, dan kebebasan berekspresi.</div>
</div>
{img('c-casama/casama-ld', 520, 930, 560, -6, 25)}
<div class='abs small' style='left:54px;bottom:54px;font-size:20px'>Independent eyewear<br>&amp; custom print.</div>
<div class='abs serif' style='right:54px;bottom:54px;font-size:44px'>Ride Your Own Style.</div>""")


LINEUP = [("Brill", "a-brill/brill-bl"), ("Ocala", "b-ocala/ocala-bb"), ("Casama", "c-casama/casama-br"),
          ("Brazz", "d-brazz/brazz-ld"), ("Duble", "e-duble/duble-bp"), ("Kurera", "f-kurera/kukera-br"),
          ("Tropic", "g-tropic/tropic-br"), ("Satvale", "h-satvale/satvale-bb"), ("Fourty", "i-fourty/fourty-tb")]


def launch_lineup():
    cells = "".join(
        f"<div style='display:flex;flex-direction:column;align-items:center'><div style='height:170px;width:300px;display:flex;align-items:center;justify-content:center'>"
        f"<img src='{cut(p)}' style='max-width:290px;max-height:160px;filter:drop-shadow(0 20px 16px rgba(0,0,0,.24))'></div>"
        f"<div class='small' style='margin-top:10px;font-size:20px;letter-spacing:.16em'>{name}</div></div>"
        for name, p in LINEUP)
    return page(f"""
<img class='logo center' src='{LOGO}' style='height:40px'>
<div class='abs sans center' style='left:0;right:0;top:190px;font-size:170px'>Belisima</div>
<div class='abs' style='left:40px;right:40px;top:400px;display:grid;grid-template-columns:repeat(3,1fr);row-gap:34px'>{cells}</div>
<div class='abs center' style='left:0;right:0;bottom:70px'>
  <div style='font-family:Inter;font-weight:800;font-style:italic;font-size:118px;letter-spacing:-0.05em;text-transform:uppercase;line-height:.9'>*Series</div>
  <div class='small' style='margin-top:14px;font-size:22px;letter-spacing:.14em'>9 model · mulai Rp100.000</div>
</div>""")


def launch_custom():
    return page(f"""
<div class='abs center caps' style='left:0;right:0;top:120px'>SCOOT custom lab</div>
<div class='abs center serif-up' style='left:0;right:0;top:180px;font-size:150px;color:#c0141f'>Make it <span class='serif' style='font-weight:700'>yours</span></div>
<div class='abs copy center' style='left:120px;right:120px;top:360px;font-size:32px'>Grafir nama, inisial, atau logo kecil di gagang kacamatamu.</div>
<div class='abs card' style='left:90px;top:490px;width:900px;height:560px'>{engraved_temple('RIDE YOUR OWN WAY', 1.75, 'gold', 1.9, 900, 560)}</div>
{badge('+Rp<br>15rb', 830, 420, 180, 10, 40)}
<div class='abs center' style='left:0;right:0;top:1100px'>
  <div class='small' style='font-size:24px;letter-spacing:.12em'>+Rp15.000/pcs · pouch hitam &amp; box cokelat</div>
  <div class='pill' style='margin-top:30px'>Coba preview di website</div>
</div>""")


def launch_order():
    rows = [("Website", "Link di bio"), ("WhatsApp", "0851 5658 1959"), ("Shopee", "Segera hadir"), ("Custom", "+Rp15.000/pcs")]
    table = "".join(f"<div><span class='k'>{k}</span><span class='v'>{v}</span></div>" for k, v in rows)
    return page(f"""
<img class='logo' src='{LOGO}'>
{img('f-kurera/kukera-br', 130, 160, 860, 4, 12)}
<div class='abs' style='left:54px;top:700px;display:flex;gap:26px;align-items:baseline;white-space:nowrap'>
  <span class='thin' style='font-size:118px'>Where</span><span class='sans' style='font-size:118px'>to shop</span>
</div>
<div class='abs table' style='left:54px;right:54px;top:870px'>{table}</div>
<div class='abs' style='left:54px;right:54px;top:1110px;display:flex;justify-content:space-between;align-items:center'>
  <div class='copy' style='font-size:26px;max-width:520px'>Pilih modelnya, tambahkan custom print, checkout via WhatsApp.</div>
  <div class='pill'>Shop now</div>
</div>
<div class='abs serif' style='left:54px;bottom:46px;font-size:40px'>Ride Your Own Style.</div>
<div class='abs small' style='right:54px;bottom:54px;font-size:20px;letter-spacing:.14em'>@scoot.eyewear</div>""")


# ---------------- Daily posts ----------------
def ocala_collection():
    shots = [("b-ocala/ocala-bb", 70, 330, 450, -4), ("b-ocala/ocala-ld", 560, 330, 450, 4),
             ("b-ocala/ocala-gi", 70, 560, 450, 3), ("b-ocala/ocala-wd", 560, 560, 450, -3),
             ("b-ocala/ocala-bl", 300, 790, 480, 0)]
    return page(f"""
<img class='logo center' src='{LOGO}' style='height:40px'>
<div class='abs sans center' style='left:0;right:0;top:170px;font-size:180px'>Ocala</div>
{''.join(img(p, x, y, w, r, 10 + i) for i, (p, x, y, w, r) in enumerate(shots))}
<div class='abs small center' style='left:0;right:0;top:1060px;font-size:22px;letter-spacing:.16em'>Hitam · Leopard · Cokelat · Cokelat kayu · Biru</div>
<div class='abs center' style='left:0;right:0;bottom:60px;font-family:Inter;font-weight:800;font-style:italic;font-size:124px;letter-spacing:-0.05em;text-transform:uppercase;line-height:.9'>*5 warna</div>""")


def custom_steps():
    steps = [("01", "Pilih model"), ("02", "Tulis cirimu"), ("03", "Preview"), ("04", "Kirim via WA")]
    cards = "".join(f"<div class='card' style='padding:26px 22px;height:170px;display:flex;flex-direction:column;justify-content:space-between'><span style='font-family:Mono;font-weight:700;font-size:20px;color:{MAROON}'>{n}</span><span class='sans' style='font-size:34px;letter-spacing:-0.035em;line-height:1'>{t}</span></div>" for n, t in steps)
    return page(f"""
<div class='abs center caps' style='left:0;right:0;top:120px'>The custom lab</div>
<div class='abs center serif-up' style='left:0;right:0;top:176px;font-size:128px;color:#c0141f;line-height:1'>4 langkah,<br><span class='serif' style='font-weight:700'>jadi milikmu</span></div>
<div class='abs card' style='left:90px;top:480px;width:900px;height:500px'>{engraved_temple('R.F. · 2026', 2.3, 'white', 1.9, 900, 500)}</div>
<div class='abs' style='left:54px;right:54px;top:1020px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px'>{cards}</div>
<div class='abs center copy' style='left:0;right:0;bottom:56px;font-size:26px'>+Rp15.000/pcs · termasuk pouch hitam &amp; box cokelat</div>""")


def shopee():
    return page(f"""
<img class='logo' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px'>Official store</div>
{img('b-ocala/ocala-ld', 400, 200, 700, -8, 12)}
{img('d-brazz/brazz-bl', -30, 450, 680, 8, 14)}
{img('h-satvale/satvale-wh', 560, 620, 560, -12, 13)}
{badge('Official<br>store', 70, 250, 210, -14, 38)}
<div class='abs center' style='left:0;right:0;top:960px'>
  <div style='font-family:Inter;font-weight:500;font-size:62px;letter-spacing:-0.035em'>sekarang hadir di</div>
  <div class='serif' style='font-size:140px;margin-top:4px'>Shopee Store</div>
  <div class='pill' style='margin-top:36px'>Shop now · link di bio</div>
</div>""")


def kurera_spec():
    rows = [("Series", "Belisima"), ("Harga", "Rp100.000"), ("Warna ready", "3 warna"), ("Custom", "+Rp15.000")]
    table = "".join(f"<div><span class='k'>{k}</span><span class='v'>{v}</span></div>" for k, v in rows)
    return page(f"""
<img class='logo' src='{LOGO}'>
{img('f-kurera/kukera-bl', 200, 110, 860, -4, 12)}
<div class='abs' style='left:54px;top:460px;display:flex;justify-content:space-between;right:54px;align-items:baseline;white-space:nowrap'>
  <span class='thin' style='font-size:124px'>SCOOT</span><span class='sans' style='font-size:124px'>Kurera</span>
</div>
<div class='abs table' style='left:54px;right:54px;top:610px'>{table}</div>
<div class='abs' style='left:0;top:830px;width:1080px;height:520px;overflow:hidden'>
  <img class='bw' src='{PHOTO['red']}' style='width:100%;height:100%;object-fit:cover;object-position:50% 34%'>
  <div class='abs' style='inset:0;background:linear-gradient(90deg,rgba(0,0,0,.55),transparent 60%)'></div>
  <div class='abs serif' style='left:54px;bottom:50px;color:#fff;font-size:84px;line-height:1'>Vintage soul.<br>Modern vision.</div>
</div>""")


def wholesale():
    tick = "<div style='position:absolute;top:-34px;left:50%;transform:translateX(-50%);width:68px;height:68px;border-radius:16px;background:#2fbf4a;color:#fff;font:800 44px Inter;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px rgba(0,0,0,.2)'>✓</div>"
    stack = "".join(
        f"<img src='{cut(p)}' style='position:absolute;left:{x}px;top:{y}px;width:330px;transform:rotate({r}deg);filter:drop-shadow(0 16px 12px rgba(0,0,0,.25))'>"
        for p, x, y, r in [("f-kurera/kukera-bl", 0, 10, -8), ("d-brazz/brazz-ld", 60, 110, 6), ("h-satvale/satvale-bb", 20, 200, -3)])
    return page(f"""
<div class='abs center caps' style='left:0;right:0;top:120px'>For communities &amp; events</div>
<div class='abs center serif-up' style='left:0;right:0;top:176px;font-size:138px;color:#c0141f'>Order <span class='serif' style='font-weight:700'>100+ pcs?</span></div>
<div class='abs card' style='left:70px;top:430px;width:450px;height:560px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:50px 30px'>
  <img src='{cut('a-brill/brill-bl')}' style='width:360px;margin-top:90px;filter:drop-shadow(0 20px 16px rgba(0,0,0,.24))'>
  <div class='center'><div class='small' style='font-size:22px;letter-spacing:.18em'>1–100 pcs</div><div class='sans' style='font-size:52px;margin-top:10px'>Harga web</div></div>
</div>
<div class='abs card' style='left:560px;top:430px;width:450px;height:560px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:50px 30px;overflow:visible'>
  {tick}
  <div style='position:relative;width:390px;height:300px'>{stack}</div>
  <div class='center'><div class='small' style='font-size:22px;letter-spacing:.18em;color:{MAROON}'>100+ pcs</div><div class='sans' style='font-size:52px;margin-top:10px'>Harga khusus</div></div>
</div>
<div class='abs center copy' style='left:110px;right:110px;top:1050px;font-size:29px'>Untuk komunitas skuter, event, merchandise, atau seragam tim. Polos atau custom print.</div>
<div class='abs center' style='left:0;right:0;bottom:64px'><div class='pill'>WA 0851 5658 1959</div></div>""")


def satvale():
    return page(f"""
<img class='logo' src='{LOGO}'>
{img('h-satvale/satvale-bb', -60, 210, 880, 10, 12)}
{img('h-satvale/satvale-st', 380, 470, 820, -12, 13)}
<div class='abs center serif' style='left:0;right:0;top:960px;font-size:62px;font-weight:500'>Colorful Culture</div>
<div class='abs center sans' style='left:0;right:0;top:1030px;font-size:176px'>Satvale</div>
<div class='abs small' style='left:54px;bottom:54px;font-size:20px'>Independent eyewear<br>&amp; custom print.</div>
<div class='abs serif' style='right:54px;bottom:54px;font-size:44px'>Ride Your Own Style.</div>""")


POSTS = {
    "01-launch-1-cover": launch_cover,
    "01-launch-2-story": launch_story,
    "01-launch-3-lineup": launch_lineup,
    "01-launch-4-custom": launch_custom,
    "01-launch-5-order": launch_order,
    "02-ocala-collection": ocala_collection,
    "03-custom-steps": custom_steps,
    "04-shopee": shopee,
    "05-kurera-vintage-soul": kurera_spec,
    "06-wholesale": wholesale,
    "07-satvale-colorful-culture": satvale,
}


def main():
    OUT_HTML.mkdir(parents=True, exist_ok=True)
    OUT_PNG.mkdir(parents=True, exist_ok=True)
    for old in [*OUT_PNG.glob("*.png"), *OUT_HTML.glob("*.html")]:
        old.unlink()
    for name, build in POSTS.items():
        html = OUT_HTML / f"{name}.html"
        html.write_text(build(), encoding="utf-8")
        png = OUT_PNG / f"{name}.png"
        subprocess.run([
            str(CHROME), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
            "--force-device-scale-factor=1", "--window-size=1080,1350", "--virtual-time-budget=6000",
            f"--screenshot={png}", html.as_uri(),
        ], check=True, capture_output=True, timeout=120)
        print("rendered", png.relative_to(ROOT))


if __name__ == "__main__":
    main()
