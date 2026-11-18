"""Cut product photos out of their white background into trimmed transparent PNGs.

usage (from repo root): python marketing/instagram/make_cutouts.py
Reads frontend/public/catalog/**.webp, writes marketing/instagram/assets/cutouts/<folder>/<file>.png
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend/public/catalog"
OUT = ROOT / "marketing/instagram/assets/cutouts"
SOFT_START = 10   # distance from white below which a pixel is fully transparent
SOFT_RANGE = 26   # distance over which it fades to fully opaque


def cutout(path: Path) -> Image.Image:
    rgb = Image.open(path).convert("RGB")
    # Per-pixel distance from pure white = darkest channel's gap to 255.
    inv = ImageChops.invert(rgb)
    r, g, b = inv.split()
    dist = ImageChops.lighter(ImageChops.lighter(r, g), b)
    alpha = dist.point(lambda v: 0 if v <= SOFT_START else min(255, int((v - SOFT_START) * 255 / SOFT_RANGE)))
    # Close pin-holes inside pale lenses so the frame reads as one object.
    alpha = alpha.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    rgba = rgb.copy()
    rgba.putalpha(alpha)
    box = alpha.point(lambda v: 255 if v > 40 else 0).getbbox()
    return rgba.crop(box) if box else rgba


def main():
    count = 0
    for src in sorted(SRC.rglob("*.webp")):
        dst = OUT / src.parent.name / f"{src.stem}.png"
        dst.parent.mkdir(parents=True, exist_ok=True)
        cutout(src).save(dst, optimize=True)
        count += 1
    print(f"cutouts: {count}")


if __name__ == "__main__":
    main()
