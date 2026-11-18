"""Normalize product photos: trim the white background, then centre each frame on an
identical white square canvas so every pair of glasses appears at the same scale.

usage (from frontend/): python scripts/normalize_products.py "public/Belisima series" public/catalog
Requires Pillow. Re-run after adding or replacing photos in public/Belisima series.
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

CANVAS = 1000          # output is CANVAS x CANVAS
MAX_W = 0.84           # glasses use at most 84% of the width...
MAX_H = 0.62           # ...and 62% of the height (tall/front-facing shots)
BG_TOLERANCE = 22      # how far from the background colour still counts as background
# Supplier labels baked into some photos (e.g. the "C1" tag above every Fourty frame).
ERASE = {"I _ FOURTY": [(150, 90, 645, 195)]}


def slug(name: str) -> str:
    stem = re.sub(r"\.[^.]+$", "", name).lower()
    return re.sub(r"[^a-z0-9]+", "-", stem).strip("-")


def content_box(im: Image.Image):
    rgb = im.convert("RGB")
    w, h = rgb.size
    # Sample the four corners to learn the background colour (most are white, a few are grey).
    corners = [rgb.getpixel(p) for p in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]]
    bg = tuple(sorted(c[i] for c in corners)[2] for i in range(3))
    diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, bg)).convert("L")
    mask = diff.point(lambda v: 255 if v > BG_TOLERANCE else 0).filter(ImageFilter.MedianFilter(5))
    return mask.getbbox(), bg


def normalize(src: Path, dst: Path):
    im = Image.open(src)
    im = im.convert("RGB")
    for region in ERASE.get(src.parent.name, []):
        im.paste((255, 255, 255), region)
    box, bg = content_box(im)
    if not box:
        box = (0, 0, *im.size)
    pad = 6
    box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
    crop = im.crop(box)
    scale = min(CANVAS * MAX_W / crop.width, CANVAS * MAX_H / crop.height)
    size = (round(crop.width * scale), round(crop.height * scale))
    crop = crop.resize(size, Image.LANCZOS)
    # Shots with a grey backdrop are re-based onto white so the grid reads as one set.
    if sum(bg) < 3 * 240:
        diff = ImageChops.difference(crop, Image.new("RGB", crop.size, bg)).convert("L")
        alpha = diff.point(lambda v: 0 if v <= BG_TOLERANCE else min(255, (v - BG_TOLERANCE) * 6))
        base = Image.new("RGB", crop.size, (255, 255, 255))
        base.paste(crop, (0, 0), alpha)
        crop = base
    canvas = Image.new("RGB", (CANVAS, CANVAS), (255, 255, 255))
    canvas.paste(crop, ((CANVAS - size[0]) // 2, (CANVAS - size[1]) // 2))
    dst.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst, "WEBP", quality=84, method=6)
    return box, size


def main():
    source, output = Path(sys.argv[1]), Path(sys.argv[2])
    count = 0
    for folder in sorted(p for p in source.iterdir() if p.is_dir()):
        for file in sorted(folder.iterdir()):
            if file.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            dst = output / slug(folder.name) / f"{slug(file.name)}.webp"
            box, size = normalize(file, dst)
            count += 1
            print(f"{folder.name}/{file.name} -> {dst.relative_to(output)}  crop={box} size={size}")
    print(f"done: {count} images")


if __name__ == "__main__":
    main()
