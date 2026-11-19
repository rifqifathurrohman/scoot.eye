"""Render the week-2 feed posts (Fri 20 – Fri 27 Nov 2026), 1080x1350, for Instagram + Facebook Page.

Formats are borrowed from reference accounts and redrawn in the SCOOT Canva style from build_posts.py:
persona series, big statement type, This-or-That, price card, dark "drop" row, product stack,
macro detail, community poster, and a promo countdown.

usage (from repo root):
  python -I -c "import sys; sys.path.insert(0,'marketing/instagram'); import runpy; runpy.run_path('marketing/instagram/build_week2.py', run_name='__main__')"
Writes HTML to marketing/instagram/html/ and PNG to marketing/instagram/export/week2/.
"""
import subprocess

import build_posts as bp
from build_posts import LOGO, MAROON, OPENING_BADGE, OPENING_LINE, badge, cut, engraved_temple, img, page, uri

OUT_PNG = bp.ROOT / "marketing/instagram/export/week2"
NEON = uri("marketing/instagram/assets/campaign-neon_3b036a8c.webp")
RED = "#c0141f"


def strike(text: str) -> str:
    return f"<s style='opacity:.45;font-weight:600'>{text}</s>"


# ---------------- Persona series (3 posts) ----------------
def persona(no: int, title: str, title_size: int, model: str, cutout: str, traits: list[str], line: str, rotate: float = -6, price: str = "100rb"):
    chips = "".join(
        f"<span style='border:2px solid #111;border-radius:999px;padding:14px 30px;font:700 24px Inter;text-transform:uppercase;letter-spacing:.08em'>{t}</span>"
        for t in traits)
    return page(f"""
<img class='logo' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px;letter-spacing:.12em'>Which SCOOT are you? · 0{no}/03</div>
<div class='abs sans' style='left:50px;top:200px;font-size:{title_size}px'>{title}</div>
{img(cutout, 90, 520, 920, rotate, 12)}
{badge(f"<span style='display:block'>{model}<span style='display:block;margin-top:8px;font-size:.62em'>{price}</span></span>", 860, 178, 180, 12, 32)}
<div class='abs' style='left:54px;right:54px;top:1020px;display:flex;gap:16px;justify-content:center'>{chips}</div>
<div class='abs copy center' style='left:110px;right:110px;top:1112px;font-size:28px'>{line}</div>
<div class='abs small' style='left:54px;bottom:50px;font-size:20px;letter-spacing:.12em'>SCOOT {model} · Belisima</div>
<div class='abs serif' style='right:54px;bottom:44px;font-size:42px'>Ride Your Own Style.</div>""")


def persona_classic():
    return persona(1, "The<br>Classic", 172, "Brill", "a-brill/brill-bl", ["Rapi", "Timeless", "Anti ribet"],
                   "Satu frame andalan buat kuliah, kerja, sampai nongkrong.")


def persona_main_character():
    return persona(2, "The Main<br>Character", 138, "Casama", "c-casama/casama-br", ["Bold", "Standout", "Kaca kuning"],
                   "Masuk ruangan, semua noleh. Lensa kuning yang bikin beda.", -4, "110rb")


def persona_rider():
    return persona(3, "The<br>Rider", 180, "Brazz", "d-brazz/brazz-bl", ["Tegas", "Kotak", "Siap jalan"],
                   "Buat yang hidupnya di atas skuter: helm, jaket, Brazz.", 5)


# ---------------- Statement (photo + huge type) ----------------
def stop_playing_safe():
    return page(f"""
<div class='abs' style='left:0;top:58px;width:1080px;height:1292px;overflow:hidden'>
  <img class='bw' src='{NEON}' style='width:100%;height:100%;object-fit:cover;object-position:62% 20%'>
  <div class='abs' style='inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,transparent 30%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.85) 100%)'></div>
</div>
<img class='logo inv' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px;color:#fff;letter-spacing:.12em'>Belisima Series</div>
<div class='abs sans' style='left:48px;top:690px;color:#fff;font-size:200px;z-index:30'>Stop<br>playing<br><span style='background:{MAROON};padding:0 18px 0 10px;margin-left:-10px'>safe.</span></div>
<div class='abs serif' style='right:54px;bottom:56px;color:#fff;font-size:46px;z-index:30'>Ride Your Own Style.</div>""")


# ---------------- This or That ----------------
def this_or_that():
    def side(letter, model, cutout, note, x, rot):
        return f"""
<div class='abs card' style='left:{x}px;top:430px;width:450px;height:600px;overflow:visible'>
  <div style='position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:84px;height:84px;border-radius:50%;background:{MAROON};color:#fff;font:800 46px Inter;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 22px rgba(0,0,0,.25)'>{letter}</div>
  <img src='{cut(cutout)}' style='position:absolute;left:20px;top:170px;width:410px;transform:rotate({rot}deg);filter:drop-shadow(0 22px 16px rgba(0,0,0,.26))'>
  <div class='center' style='position:absolute;left:0;right:0;bottom:50px'>
    <div class='sans' style='font-size:64px'>{model}</div>
    <div class='small' style='margin-top:12px;font-size:20px;letter-spacing:.16em'>{note}</div>
  </div>
</div>"""
    return page(f"""
<div class='abs center caps' style='left:0;right:0;top:118px'>Weekend poll</div>
<div class='abs center serif-up' style='left:0;right:0;top:172px;font-size:150px;color:{RED}'>This <span class='serif' style='font-weight:700'>or</span> that?</div>
{side('A', 'Brazz', 'd-brazz/brazz-ld', 'Leopard · kotak tegas', 70, -6)}
{side('B', 'Casama', 'c-casama/casama-br', 'Hitam · kaca kuning', 560, 6)}
<div class='abs center' style='left:0;right:0;top:1090px'>
  <div class='copy' style='font-size:30px'>Kalau cuma boleh pilih satu, kamu tim mana?</div>
  <div class='pill' style='margin-top:30px'>Komen A atau B 👇</div>
</div>""")


# ---------------- Price card ----------------
def price_card():
    rows = [
        ("Semua frame", "Belisima Series", f"100K", strike("120K")),
        ("Casama", "Kaca kuning & leopard", "110K", strike("130K")),
        ("Custom grafir", "Putih · nama / logo kecil", "+15K", ""),
        ("Grosir 100+ pcs", "Komunitas & event", "Harga<br>khusus", ""),
    ]
    cards = "".join(f"""
<div class='card' style='display:flex;align-items:center;justify-content:space-between;height:156px;padding:0 20px 0 40px'>
  <div><div class='sans' style='font-size:46px'>{k}</div><div class='small' style='margin-top:10px;font-size:19px;letter-spacing:.14em;color:#555'>{sub}</div></div>
  <div style='display:flex;align-items:center;gap:18px'>
    <span style='font:700 26px Inter'>{old}</span>
    <span style='background:{MAROON if i < 2 else '#1d1d1d'};color:#fff;border-radius:20px;min-width:250px;height:116px;display:flex;align-items:center;justify-content:center;text-align:center;font-family:Inter;font-weight:800;letter-spacing:-0.04em;line-height:.9;text-transform:uppercase;font-size:{70 if '<br>' not in v else 38}px'>{v}</span>
  </div>
</div>""" for i, (k, sub, v, old) in enumerate(rows))
    return page(f"""
<div class='abs center caps' style='left:0;right:0;top:118px'>Opening deal</div>
<div class='abs center serif-up' style='left:0;right:0;top:172px;font-size:136px;color:{RED};line-height:1'>Harga <span class='serif' style='font-weight:700'>spesial</span></div>
<div class='abs' style='left:70px;right:70px;top:400px;display:flex;flex-direction:column;gap:22px'>{cards}</div>
<div class='abs center' style='left:0;right:0;bottom:60px'>
  <div class='pill'>Berlaku s/d Minggu 29 Nov</div>
  <div class='small' style='margin-top:20px;font-size:20px;letter-spacing:.16em'>scooteyewear.my.id · WA 0851 5658 1959</div>
</div>""")


# ---------------- Dark drop row ----------------
def fourty_drop():
    shots = [("i-fourty/fourty-cl", 420, 250, 700, -10), ("i-fourty/fourty-tb", -60, 520, 720, 8), ("i-fourty/fourty-bl", 380, 790, 720, -6)]
    return page(f"""
<div class='abs' style='inset:0;background:radial-gradient(ellipse 80% 65% at 50% 50%,#2b2b2b 0%,#141414 70%,#0a0a0a 100%);z-index:0'></div>
<img class='logo inv' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px;color:#ddd;letter-spacing:.12em'>Belisima · 09</div>
<div class='abs serif' style='left:54px;top:220px;color:#fff;font-size:66px;z-index:20'>Just dropped</div>
{''.join(img(p, x, y, w, r, 10 + i) for i, (p, x, y, w, r) in enumerate(shots))}
<div class='abs small' style='left:54px;top:1120px;color:#cfcfcf;font-size:22px;letter-spacing:.16em;z-index:20'>Hitam · Clear · Biru transparan</div>
<div class='abs sans' style='left:48px;bottom:44px;color:#fff;font-size:176px;z-index:20'>Fourty</div>
<div class='abs' style='right:54px;bottom:70px;z-index:20;text-align:right;color:#fff'>
  <div class='small' style='font-size:20px;letter-spacing:.14em;color:#bbb'>Opening</div>
  <div class='sans' style='font-size:76px'>100rb</div>
</div>""")


# ---------------- Product stack ----------------
def duble_stack():
    frames = ["e-duble/duble-bl", "e-duble/duble-lb", "e-duble/duble-pp", "e-duble/duble-br", "e-duble/duble-tc", "e-duble/duble-bp"]
    rot = [-5, 4, -3, 6, -4, 2]
    stack = "".join(img(p, 190 + (i % 2) * 40 - 20, 300 + i * 104, 680, rot[i], 10 + i) for i, p in enumerate(frames))
    return page(f"""
<img class='logo' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px;letter-spacing:.12em'>Belisima · 05</div>
<div class='abs' style='left:54px;top:180px;display:flex;align-items:baseline;gap:24px;white-space:nowrap'>
  <span class='sans' style='font-size:128px'>Stack</span><span class='serif' style='font-size:118px'>your mood</span>
</div>
{stack}
{badge(OPENING_BADGE, 830, 1060, 190, 12, 29)}
<div class='abs sans' style='left:48px;bottom:58px;font-size:150px'>Duble</div>
<div class='abs small' style='left:54px;bottom:224px;font-size:22px;letter-spacing:.16em'>6 warna ready · half-frame</div>""")


# ---------------- Macro detail ----------------
def details_matter():
    return page(f"""
<div class='abs' style='left:0;top:58px'>{engraved_temple('RIDE YOUR OWN STYLE', 1.75, 'white', 2.7, 1080, 820)}</div>
<div class='abs' style='left:54px;right:54px;top:940px;display:flex;align-items:baseline;gap:26px;white-space:nowrap'>
  <span class='sans' style='font-size:136px'>Details</span><span class='serif' style='font-size:124px'>matter.</span>
</div>
<div class='abs copy' style='left:54px;top:1110px;width:560px;font-size:28px'>Nama, inisial, atau logo kecil, digrafir rapi di gagang kacamatamu.</div>
<div class='abs' style='right:54px;top:1120px'><div class='pill'>+Rp15.000/pcs</div></div>
<div class='abs small' style='left:54px;bottom:50px;font-size:20px;letter-spacing:.12em'>SCOOT Custom Lab</div>
<div class='abs serif' style='right:54px;bottom:44px;font-size:42px'>Make it yours.</div>""")


# ---------------- Community poster ----------------
def community_wall():
    steps = [("01", "Pakai SCOOT-mu"), ("02", "Foto gayamu"), ("03", "Tag @scoot.eyewear"), ("04", "Kami repost di story")]
    grid = "".join(f"<div style='padding:28px 30px;border:2px solid #f2f2f2;margin:-1px'><div style='font:700 20px Mono;color:#ff4d55'>{n}</div><div class='sans' style='font-size:42px;margin-top:14px;letter-spacing:-0.035em'>{t}</div></div>" for n, t in steps)
    return page(f"""
<div class='abs' style='inset:0;background:#111;z-index:0'></div>
<img class='logo inv' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px;color:#ddd;letter-spacing:.12em'>Community wall · Vol. 01</div>
<div class='abs sans' style='left:48px;top:200px;color:#fff;font-size:150px;z-index:20'>Ride<br>your own<br><span class='serif' style='text-transform:none;font-size:170px;color:#ff4d55'>style.</span></div>
{img('g-tropic/tropic-br', 430, 560, 600, -10, 15)}
<div class='abs' style='left:54px;right:54px;top:880px;display:grid;grid-template-columns:1fr 1fr;color:#fff;z-index:20'>{grid}</div>
<div class='abs' style='left:54px;right:54px;bottom:60px;display:flex;justify-content:space-between;align-items:center;color:#fff;z-index:20'>
  <span class='sans' style='font-size:52px;color:#fff'>#rideyourownstyle</span>
  <span class='small' style='font-size:20px;letter-spacing:.14em;color:#bbb'>Tag kami!</span>
</div>""")


# ---------------- Countdown ----------------
def countdown():
    return page(f"""
<img class='logo' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px;letter-spacing:.12em'>Opening promo · last call</div>
<div class='abs center caps' style='left:0;right:0;top:200px'>Tinggal</div>
<div class='abs center' style='left:0;right:0;top:170px;font-family:Inter;font-weight:900;font-size:640px;letter-spacing:-0.08em;line-height:1;color:{MAROON}'>2</div>
<div class='abs center serif' style='left:0;right:0;top:770px;font-size:120px'>hari lagi</div>
{img('b-ocala/ocala-ld', -110, 560, 420, 16, 15)}
{img('f-kurera/kukera-br', 770, 300, 400, -14, 15)}
<div class='abs' style='left:90px;right:90px;top:960px;display:grid;grid-template-columns:1fr 1fr;border:2px solid #222'>
  <div style='padding:26px 30px;border-right:2px solid #222'><div class='small' style='font-size:19px;letter-spacing:.14em'>s/d Min 29 Nov</div><div class='sans' style='font-size:70px;margin-top:10px;color:{MAROON}'>100rb</div></div>
  <div style='padding:26px 30px'><div class='small' style='font-size:19px;letter-spacing:.14em'>Mulai Sen 30 Nov</div><div class='sans' style='font-size:70px;margin-top:10px;opacity:.45'>120rb</div></div>
</div>
<div class='abs center' style='left:0;right:0;bottom:60px'><div class='pill'>Checkout sekarang · link di bio</div></div>""")


# ---------------- Last weekend of the opening promo ----------------
def last_weekend():
    return page(f"""
<img class='logo' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px;letter-spacing:.12em'>Opening promo · Sab 28 Nov</div>
{img('d-brazz/brazz-ld', 420, 170, 680, -9, 12)}
{img('h-satvale/satvale-bb', -50, 420, 660, 8, 14)}
{img('e-duble/duble-pp', 560, 600, 560, -12, 13)}
{badge(OPENING_BADGE, 70, 210, 220, -14, 33)}
<div class='abs center' style='left:0;right:0;top:930px'>
  <div style='font-family:Inter;font-weight:500;font-size:60px;letter-spacing:-0.035em'>this is the</div>
  <div class='serif' style='font-size:150px;margin-top:2px'>Last Weekend</div>
  <div class='small' style='margin-top:24px;font-size:22px;letter-spacing:.12em'>{OPENING_LINE}</div>
  <div class='pill' style='margin-top:30px'>Shop now · link di bio</div>
</div>""")


def gift_idea():
    return page(f"""
<div class='abs center caps' style='left:0;right:0;top:118px'>Gift idea · akhir tahun</div>
<div class='abs center serif-up' style='left:0;right:0;top:172px;font-size:128px;color:{RED};line-height:1'>Kado yang<br><span class='serif' style='font-weight:700'>personal</span></div>
<div class='abs copy center' style='left:120px;right:120px;top:440px;font-size:30px'>Grafir namanya, inisialnya, atau tanggal spesial kalian di gagang kacamata.</div>
<div class='abs card' style='left:90px;top:560px;width:900px;height:480px'>{engraved_temple('FOR YOU · 2026', 2.1, 'white', 1.9, 900, 480)}</div>
{badge('+Rp<br>15rb', 850, 500, 170, 10, 38)}
<div class='abs center' style='left:0;right:0;top:1080px'>
  <div class='small' style='font-size:23px;letter-spacing:.12em'>Pouch hitam &amp; box cokelat · siap dikado</div>
  <div class='pill' style='margin-top:30px'>Harga opening berakhir besok</div>
</div>
<div class='abs serif center' style='left:0;right:0;bottom:46px;font-size:40px'>Make it yours.</div>""")


def last_day():
    return page(f"""
<img class='logo' src='{LOGO}'>
<div class='abs small' style='right:54px;top:112px;letter-spacing:.12em'>Min 29 Nov · berakhir 23.59</div>
<div class='abs center caps' style='left:0;right:0;top:210px'>Opening promo</div>
<div class='abs center sans' style='left:0;right:0;top:280px;font-size:200px;color:{MAROON}'>Hari<br>terakhir</div>
{img('a-brill/brill-ld', -60, 720, 560, 10, 12)}
{img('c-casama/casama-lg', 520, 700, 600, -10, 13)}
<div class='abs' style='left:90px;right:90px;top:990px;display:grid;grid-template-columns:1fr 1fr;border:2px solid #222'>
  <div style='padding:26px 30px;border-right:2px solid #222'><div class='small' style='font-size:19px;letter-spacing:.14em'>Hari ini saja</div><div class='sans' style='font-size:70px;margin-top:10px;color:{MAROON}'>100rb</div></div>
  <div style='padding:26px 30px'><div class='small' style='font-size:19px;letter-spacing:.14em'>Mulai besok</div><div class='sans' style='font-size:70px;margin-top:10px;opacity:.45'>120rb</div></div>
</div>
<div class='abs center' style='left:0;right:0;bottom:60px'><div class='pill'>Checkout sebelum 23.59</div></div>""")


def story_final_hours():
    import build_stories as bs
    return bs.story(f"""
{bs.logo()}
<div class='abs small' style='right:54px;top:280px'>Opening promo</div>
<div class='abs center caps' style='left:0;right:0;top:470px'>Tinggal</div>
<div class='abs center' style='left:0;right:0;top:440px;font-family:Inter;font-weight:900;font-size:700px;letter-spacing:-0.08em;line-height:1;color:{MAROON}'>4</div>
<div class='abs center serif' style='left:0;right:0;top:1120px;font-size:150px'>jam lagi</div>
{img('f-kurera/kukera-br', -90, 860, 470, 16, 15)}
{img('b-ocala/ocala-ld', 720, 620, 460, -14, 15)}
<div class='abs center' style='left:0;right:0;top:1330px'>
  <div class='small' style='font-size:26px;letter-spacing:.12em'>Harga opening 100rb berakhir 23.59</div>
  <div class='pill' style='margin-top:34px;font-size:30px'>scooteyewear.my.id</div>
</div>""")


POSTS = {
    "08-stop-playing-safe": stop_playing_safe,
    "09-this-or-that": this_or_that,
    "10-persona-classic": persona_classic,
    "11-duble-stack": duble_stack,
    "12-price-card": price_card,
    "13-fourty-drop": fourty_drop,
    "14-persona-main-character": persona_main_character,
    "15-details-matter": details_matter,
    "16-persona-rider": persona_rider,
    "17-community-wall": community_wall,
    "18-countdown": countdown,
    "19-last-weekend": last_weekend,
    "20-gift-idea": gift_idea,
    "21-last-day": last_day,
}


def main():
    bp.OUT_HTML.mkdir(parents=True, exist_ok=True)
    OUT_PNG.mkdir(parents=True, exist_ok=True)
    for name, build in POSTS.items():
        html = bp.OUT_HTML / f"{name}.html"
        html.write_text(build(), encoding="utf-8")
        png = OUT_PNG / f"{name}.png"
        subprocess.run([
            str(bp.CHROME), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
            "--force-device-scale-factor=1", "--window-size=1080,1350", "--virtual-time-budget=6000",
            f"--screenshot={png}", html.as_uri(),
        ], check=True, capture_output=True, timeout=120)
        print("rendered", png.relative_to(bp.ROOT))
    import build_stories as bs
    bs.render(story_final_hours(), "s7-final-hours", bs.OUT_STORY)
    print("rendered story s7-final-hours")


if __name__ == "__main__":
    main()
