#!/usr/bin/env python3
"""Cut the subject out of a photo, leaving a transparent background.

Pair this with ascii-art.py: a busy background converts into character noise that
swamps the subject, so isolate the subject first.

Needs rembg, which is heavy enough to keep out of the main script:

    python3 -m venv .venv-cutout
    .venv-cutout/bin/pip install "rembg[cli]" onnxruntime
    .venv-cutout/bin/python scripts/cutout.py photo.jpg -o photo-cut.png
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageOps
from rembg import new_session, remove

# u2net is the general-purpose model and handles animals well.
DEFAULT_MODEL = "u2net"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Remove the background from a photo.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("input", type=Path, help="Source photo.")
    parser.add_argument("-o", "--output", type=Path, help="Output PNG path.")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="rembg model name.")
    parser.add_argument(
        "--alpha-matting",
        action="store_true",
        help="Slower, but cleaner edges around fur.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.input.exists():
        raise SystemExit(f"Input not found: {args.input}")

    output = args.output or args.input.with_name(f"{args.input.stem}-cut.png")
    output.parent.mkdir(parents=True, exist_ok=True)

    source = ImageOps.exif_transpose(Image.open(args.input))
    result = remove(
        source,
        session=new_session(args.model),
        alpha_matting=args.alpha_matting,
    )
    result.save(output)

    box = result.getchannel("A").getbbox()
    print(f"Wrote {output} ({result.width}x{result.height}, subject bbox {box})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
