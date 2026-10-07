#!/usr/bin/env bash
# make_transparent.sh: CLI helper to convert images with solid backgrounds into transparent PNGs using ImageMagick
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <input_image> <output_png> [color_or_mode] [fuzz_percent]"
  echo "Examples:"
  echo "  $0 icon.jpg icon.png white 10%"
  echo "  $0 mascot.jpg mascot.png '#00FF00' 15%"
  echo "  $0 logo.jpg logo.png corner 15%      (auto-floodfill from top-left corner)"
  exit 1
fi

INPUT="$1"
OUTPUT="$2"
COLOR="${3:-white}"
FUZZ="${4:-10%}"

if ! command -v magick &>/dev/null; then
  echo "Error: ImageMagick (magick) is not installed."
  exit 1
fi

if [ ! -f "$INPUT" ]; then
  echo "Error: Input file '$INPUT' not found."
  exit 1
fi

if [ "$COLOR" = "corner" ] || [ "$COLOR" = "floodfill" ]; then
  echo "Processing $INPUT -> $OUTPUT (floodfill transparency from corner with $FUZZ fuzz)..."
  magick "$INPUT" -fuzz "$FUZZ" -fill none -draw "matte 0,0 floodfill" "$OUTPUT"
else
  echo "Processing $INPUT -> $OUTPUT (making $COLOR transparent with $FUZZ fuzz)..."
  magick "$INPUT" -fuzz "$FUZZ" -transparent "$COLOR" "$OUTPUT"
fi

echo "Successfully saved transparent PNG: $OUTPUT"
