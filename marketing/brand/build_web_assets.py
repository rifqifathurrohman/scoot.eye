"""Render favicons and the link-preview (Open Graph) image for the website.

usage (from repo root): python marketing/brand/build_web_assets.py
Writes into frontend/public/: favicon.ico, favicon-16x16.png, favicon-32x32.png, icon-192.png, icon-512.png,
apple-touch-icon.png (all from marketing/brand/favicon-source.png, the helmet mascot) and og-image.jpg. Needs Google Chrome and Pillow.
"""
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "frontend/public"
TMP = ROOT / "marketing/brand/.build"
CHROME = Path("C:/Program Files/Google/Chrome/Application/chrome.exe")
FONT = (ROOT / "frontend/node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2").as_uri()
INTER = (ROOT / "frontend/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2").as_uri()
SERIF = (ROOT / "frontend/node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2").as_uri()
LOGO = (PUBLIC / "scoot-eyewear-wordmark-dark.png").as_uri()
PHOTO = (ROOT / "marketing/instagram/assets/campaign-maroon_2b77d7cf.webp").as_uri()

OG_HTML = f"""<!doctype html><html><head><meta charset='utf-8'><style>
@font-face {{ font-family: 'SG'; src: url('{FONT}') format('woff2'); font-weight: 300 700; }}
@font-face {{ font-family: 'Inter'; src: url('{INTER}') format('woff2'); font-weight: 100 900; }}
@font-face {{ font-family: 'Serif'; src: url('{SERIF}') format('woff2'); font-style: italic; font-weight: 400 900; }}
* {{ margin:0; padding:0; box-sizing:border-box }}
html,body {{ width:1200px; height:630px; overflow:hidden; background:#0a0a0a; }}
.bg {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:58% 30%; opacity:.82 }}
.shade {{ position:absolute; inset:0; background:linear-gradient(90deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.55) 45%,rgba(0,0,0,.05) 100%) }}
.wrap {{ position:absolute; left:64px; top:56px; bottom:56px; width:640px; color:#fff; display:flex; flex-direction:column }}
.logo {{ height:44px; width:auto; filter:invert(1); align-self:flex-start }}
h1 {{ font-family:'SG'; font-weight:700; text-transform:uppercase; letter-spacing:-0.08em; line-height:.86; font-size:112px; margin-top:auto }}
.serif {{ font-family:'Serif'; font-style:italic; font-weight:600; font-size:40px; margin-top:18px }}
.tag {{ display:inline-block; margin-top:26px; background:#c8102e; font:700 20px Inter; letter-spacing:.08em; text-transform:uppercase; padding:12px 20px; align-self:flex-start }}
.url {{ position:absolute; right:56px; bottom:48px; color:#fff; font:600 20px Inter; letter-spacing:.16em; text-transform:uppercase }}
</style></head><body>
<img class='bg' src='{PHOTO}'><div class='shade'></div>
<div class='wrap'><img class='logo' src='{LOGO}'><h1>Ride your<br>own style.</h1>
<div class='serif'>Independent eyewear &amp; custom print</div>
<div class='tag'>9 model · mulai Rp100.000</div></div>
<div class='url'>scooteyewear.my.id</div>
</body></html>"""


def chrome_png(html: Path, png: Path, w: int, h: int):
    subprocess.run([str(CHROME), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
                    "--force-device-scale-factor=1", f"--window-size={w},{h}", "--virtual-time-budget=5000",
                    f"--screenshot={png}", html.as_uri()], check=True, capture_output=True, timeout=120)


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    icon = Image.open(ROOT / "marketing/brand/favicon-source.png").convert("RGBA")
    side = min(icon.size)
    icon = icon.crop(((icon.width - side) // 2, (icon.height - side) // 2, (icon.width + side) // 2, (icon.height + side) // 2))
    for name, size in [("icon-512.png", 512), ("icon-192.png", 192), ("apple-touch-icon.png", 180),
                       ("favicon-32x32.png", 32), ("favicon-16x16.png", 16)]:
        icon.resize((size, size), Image.LANCZOS).save(PUBLIC / name)
    icon.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    og_html = TMP / "og.html"
    og_html.write_text(OG_HTML, encoding="utf-8")
    og_png = TMP / "og.png"
    chrome_png(og_html, og_png, 1200, 630)
    Image.open(og_png).convert("RGB").save(PUBLIC / "og-image.jpg", quality=86, optimize=True)
    print("web assets written to frontend/public")


if __name__ == "__main__":
    main()
