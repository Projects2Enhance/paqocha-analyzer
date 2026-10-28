#!/usr/bin/env bash
set -euo pipefail

# Trims public/video.mp4 (the Hero background, see components/hero/hero.tsx)
# down to [START_SECONDS, end], dropping a lead-in that doesn't loop well.
#
# Re-encodes instead of stream-copying: a stream copy can only cut on a
# keyframe, which rarely lands exactly on START_SECONDS, so the trim would
# start early/late by up to one GOP. ffmpeg's accurate seek (-ss before -i,
# while re-encoding) decodes from the nearest keyframe but only starts
# writing output at the exact requested frame.
#
# Usage: scripts/trim-hero-video.sh [start_seconds] [input] [output]
cd "$(dirname "${BASH_SOURCE[0]}")/.."

START_SECONDS="${1:-16}"
INPUT="${2:-public/video.mp4}"
OUTPUT="${3:-$INPUT}"
TMP="${OUTPUT%.mp4}.trim-tmp.mp4"

ffmpeg -y -ss "$START_SECONDS" -i "$INPUT" \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p \
  -an -movflags +faststart \
  "$TMP"

mv "$TMP" "$OUTPUT"

echo "Trimmed ${INPUT} from ${START_SECONDS}s -> ${OUTPUT}"
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "$OUTPUT"
