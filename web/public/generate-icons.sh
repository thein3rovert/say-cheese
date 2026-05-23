#!/bin/bash
# Simple placeholder icons - replace with real ones later
convert -size 192x192 xc:black -font DejaVu-Sans -pointsize 120 -fill white -gravity center -annotate +0+0 "📸" icon-192.png 2>/dev/null || echo "Install ImageMagick to generate icons, or add them manually"
convert -size 512x512 xc:black -font DejaVu-Sans -pointsize 320 -fill white -gravity center -annotate +0+0 "📸" icon-512.png 2>/dev/null || true
