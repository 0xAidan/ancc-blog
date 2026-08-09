#!/usr/bin/env python3
"""Turn a photo into true ASCII art and render it as a PNG for use on the site.

Every pixel block in the output is a real typed character, so the result has the
"made of / - ~ . #" texture rather than the smooth AI-painted approximation of it.

Example:
    python3 scripts/ascii-art.py photos/sherman.jpg -o public/sherman-ascii.png --cols 220
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageColor, ImageDraw, ImageFont, ImageOps

# Ramps run darkest -> brightest. Index is chosen by pixel luminance.
CHARSETS: dict[str, str] = {
    "classic": " .:-=+*#%@",
    "code": " .,:;~-_+=*/\\|()[]{}<>!?ilI1tfjxznuvcJYLCQ0OZ#%@",
    "dense": " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    "slashes": " .-~:;+*/\\|#%@",
    "blocks": " \u2591\u2592\u2593\u2588",
}

# (path, face index) pairs, tried in order. Menlo is the classic terminal face.
FONT_CANDIDATES: list[tuple[str, int]] = [
    ("/System/Library/Fonts/Menlo.ttc", 0),
    ("/System/Library/Fonts/SFNSMono.ttf", 0),
    ("/System/Library/Fonts/Courier.ttc", 0),
]

HEIC_SUFFIXES = {".heic", ".heif"}


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for path, index in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size, index=index)
        except OSError:
            continue
    raise SystemExit("No usable monospace font found. Install Menlo or pass a different system.")


def load_image(path: Path) -> Image.Image:
    """Open the photo, converting HEIC via macOS sips since Pillow cannot read it."""
    if path.suffix.lower() in HEIC_SUFFIXES:
        converted = Path(tempfile.mkdtemp()) / f"{path.stem}.png"
        result = subprocess.run(
            ["sips", "-s", "format", "png", str(path), "--out", str(converted)],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0 or not converted.exists():
            raise SystemExit(f"Could not convert {path.name} from HEIC:\n{result.stderr.strip()}")
        path = converted

    try:
        image = Image.open(path)
    except OSError as error:
        raise SystemExit(f"Could not open {path}: {error}") from error

    # iPhone photos carry rotation in EXIF; bake it in so the dog is upright.
    return ImageOps.exif_transpose(image).convert("RGB")


def build_grid(
    image: Image.Image,
    cols: int,
    cell_ratio: float,
    contrast_cutoff: float,
    invert: bool,
) -> Image.Image:
    """Downsample the photo to one grayscale value per character cell."""
    # Character cells are taller than they are wide, so scale rows by that ratio
    # to keep the rendered PNG the same shape as the source photo.
    rows = max(1, round(image.height / image.width * cols * cell_ratio))
    gray = image.convert("L").resize((cols, rows), Image.Resampling.LANCZOS)

    if contrast_cutoff > 0:
        gray = ImageOps.autocontrast(gray, cutoff=contrast_cutoff)
    if invert:
        gray = ImageOps.invert(gray)

    return gray


def grid_to_rows(grid: Image.Image, charset: str, threshold: int) -> list[str]:
    """Map each cell's brightness onto a character, blanking anything below threshold."""
    last = len(charset) - 1
    rows: list[str] = []

    for y in range(grid.height):
        line = []
        for x in range(grid.width):
            level = grid.getpixel((x, y))
            line.append(" " if level < threshold else charset[level * last // 255])
        rows.append("".join(line))

    return rows


def render_png(
    rows: list[str],
    grid: Image.Image,
    font: ImageFont.FreeTypeFont,
    fg: tuple[int, int, int],
    bg: tuple[int, int, int],
    transparent: bool,
    shade: bool,
) -> Image.Image:
    cell_w = max(1, round(font.getlength("M")))
    ascent, descent = font.getmetrics()
    cell_h = ascent + descent

    width = cell_w * grid.width
    height = cell_h * len(rows)
    background = (0, 0, 0, 0) if transparent else (*bg, 255)
    canvas = Image.new("RGBA", (width, height), background)
    draw = ImageDraw.Draw(canvas)

    for row_index, line in enumerate(rows):
        y = row_index * cell_h
        for col_index, char in enumerate(line):
            if char == " ":
                continue
            if shade:
                # Dim darker cells so the portrait keeps depth instead of reading flat.
                level = grid.getpixel((col_index, row_index))
                weight = 0.35 + 0.65 * (level / 255)
                color = (*(round(channel * weight) for channel in fg), 255)
            else:
                color = (*fg, 255)
            draw.text((col_index * cell_w, y), char, font=font, fill=color)

    return canvas


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a photo into real ASCII art rendered as a PNG.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("input", type=Path, help="Source photo (jpg, png, heic).")
    parser.add_argument("-o", "--output", type=Path, help="Output PNG path.")
    parser.add_argument("--cols", type=int, default=200, help="Character columns; higher = finer.")
    parser.add_argument(
        "--charset",
        choices=sorted(CHARSETS),
        default="dense",
        help="Character ramp used for shading.",
    )
    parser.add_argument("--font-size", type=int, default=14, help="Rendered character size in px.")
    parser.add_argument("--fg", default="#6ec4e8", help="Character color.")
    parser.add_argument("--bg", default="#0a0a0c", help="Background color.")
    parser.add_argument("--transparent", action="store_true", help="Transparent background.")
    parser.add_argument(
        "--shade",
        action="store_true",
        help="Dim characters in darker areas for more depth.",
    )
    parser.add_argument(
        "--threshold",
        type=int,
        default=0,
        help="Blank out cells darker than this (0-255); drops a dark background.",
    )
    parser.add_argument(
        "--contrast",
        type=float,
        default=2.0,
        help="Autocontrast cutoff percent; 0 disables.",
    )
    parser.add_argument("--invert", action="store_true", help="Invert light and dark.")
    parser.add_argument("--txt", action="store_true", help="Also write a .txt of the characters.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.input.exists():
        raise SystemExit(f"Input not found: {args.input}")
    if args.cols < 8:
        raise SystemExit("--cols must be at least 8.")

    output = args.output or args.input.with_name(f"{args.input.stem}-ascii.png")
    output.parent.mkdir(parents=True, exist_ok=True)

    font = load_font(args.font_size)
    cell_w = max(1, round(font.getlength("M")))
    ascent, descent = font.getmetrics()
    cell_ratio = cell_w / (ascent + descent)

    image = load_image(args.input)
    grid = build_grid(image, args.cols, cell_ratio, args.contrast, args.invert)
    rows = grid_to_rows(grid, CHARSETS[args.charset], args.threshold)

    canvas = render_png(
        rows,
        grid,
        font,
        ImageColor.getrgb(args.fg),
        ImageColor.getrgb(args.bg),
        args.transparent,
        args.shade,
    )
    canvas.save(output)

    if args.txt:
        text_path = output.with_suffix(".txt")
        text_path.write_text("\n".join(rows) + "\n", encoding="utf-8")
        print(f"Wrote {text_path}")

    print(f"Wrote {output} ({canvas.width}x{canvas.height}, {grid.width}x{grid.height} characters)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
