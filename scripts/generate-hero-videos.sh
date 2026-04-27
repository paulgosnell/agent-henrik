#!/bin/bash
# Agent Henrik - Hero Video V3 Batch Generator
# Uses xAI Grok Imagine Video API directly
# Generates all clips, polls for completion, downloads .mp4 files

set -e

# Config
OUTPUT_DIR="$HOME/Downloads/hero-v3-clips"
mkdir -p "$OUTPUT_DIR"

# API Key
XAI_KEY=$(grep "XAI_API_KEY" /Users/paulgosnell/Sites/p0stman-next/.env.production | head -1 | sed 's/XAI_API_KEY="//' | sed 's/\\n"//' | sed 's/"$//')

# Supabase public URLs for Henrik reference photos
source /Users/paulgosnell/Sites/agent-henrik/.env.local
REF1="${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/henrik-ref-1.jpg"
REF2="${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/henrik-ref-2.jpg"
REF3="${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/henrik-ref-3.jpg"

echo "=== Agent Henrik Hero V3 Video Generator ==="
echo "Output: $OUTPUT_DIR"
echo ""

# Function to submit a video generation job
submit_video() {
  local name="$1"
  local prompt="$2"
  local use_refs="$3"  # "yes" or "no"

  local ref_json=""
  if [ "$use_refs" = "yes" ]; then
    ref_json='"reference_images": [{"url": "'"$REF1"'"}, {"url": "'"$REF2"'"}, {"url": "'"$REF3"'"}],'
  fi

  local response
  response=$(curl -s -X POST "https://api.x.ai/v1/videos/generations" \
    -H "Authorization: Bearer $XAI_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "grok-imagine-video",
      "prompt": "'"$prompt"'",
      '"$ref_json"'
      "duration": 6,
      "aspect_ratio": "16:9",
      "resolution": "720p"
    }')

  local request_id
  request_id=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('request_id',''))" 2>/dev/null)

  if [ -z "$request_id" ]; then
    echo "  ERROR: Failed to submit. Response: $response" >&2
    return 1
  fi

  echo "  Submitted: $request_id" >&2
  echo "$request_id"
}

# Function to poll and download a completed video
poll_and_download() {
  local name="$1"
  local request_id="$2"
  local max_attempts=60  # 5 minutes max

  for i in $(seq 1 $max_attempts); do
    local response
    response=$(curl -s "https://api.x.ai/v1/videos/${request_id}" \
      -H "Authorization: Bearer $XAI_KEY")

    local status
    status=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null)

    case "$status" in
      "done"|"completed"|"succeeded")
        local video_url
        video_url=$(echo "$response" | python3 -c "
import sys, json
d = json.load(sys.stdin)
# xAI API returns: {status: 'done', video: {url: '...'}}
if 'video' in d and 'url' in d.get('video', {}):
    print(d['video']['url'])
elif 'video_url' in d:
    print(d['video_url'])
else:
    print('')
" 2>/dev/null)

        if [ -n "$video_url" ] && [ "$video_url" != "" ]; then
          echo "  Downloading ${name}.mp4..."
          curl -s -o "${OUTPUT_DIR}/${name}.mp4" "$video_url"
          local size
          size=$(ls -lh "${OUTPUT_DIR}/${name}.mp4" | awk '{print $5}')
          echo "  Done! (${size})"
          return 0
        else
          echo "  WARNING: Video done but no URL found. Full response saved to /tmp/grok-debug-${name}.json"
          echo "$response" > "/tmp/grok-debug-${name}.json"
          return 1
        fi
        ;;
      "failed"|"error")
        echo "  FAILED: $response"
        return 1
        ;;
      "expired")
        echo "  EXPIRED: Generation timed out on server side"
        return 1
        ;;
      *)
        printf "  [%s] %s - waiting 5s...\n" "$name" "$status" >&2
        sleep 5
        ;;
    esac
  done

  echo "  TIMEOUT: Polling exceeded ${max_attempts} attempts"
  return 1
}

# Function to generate a single clip end-to-end
generate_clip() {
  local name="$1"
  local prompt="$2"
  local use_refs="$3"

  echo ""
  echo ">>> Generating: $name"
  local request_id
  request_id=$(submit_video "$name" "$prompt" "$use_refs")

  if [ $? -ne 0 ] || [ -z "$request_id" ]; then
    echo "  Skipping $name due to submission error"
    return 1
  fi

  poll_and_download "$name" "$request_id"
}

# ============================================================
# CLIP DEFINITIONS - V3 Prompts
# ============================================================

echo "Starting batch generation..."

# Clip 0 - Factory Opening (Henrik refs: YES)
generate_clip "clip-00-factory-opening" \
  "Medium-wide shot, Kraftwerk Berlin main hall, towering concrete walls, steel beams, sharp light shafts cutting through haze. A man in a white smoking jacket and black bow tie, champagne glass in right hand, stands centered with a knowing smirk, beckons with left hand in a follow-me gesture, then strides confidently into the dark industrial depths. Slow 360 camera orbit. Showcasing raw underground grandeur." \
  "yes"

# Clip 1 - Hong Kong (Henrik refs: YES)
generate_clip "clip-01-hong-kong" \
  "Medium-wide shot, Victoria Peak lookout at dusk, Hong Kong. Bank of China Tower triangular glass facade, IFC tower, harbour ferries on dark water below. A man in a white suit jacket, open-collar white shirt, no tie, no bowtie, stands at the stone railing, warm smile, turns his head toward the neon-lit skyline. Camera pushes past his shoulder revealing the full harbour panorama. Showcasing authentic Victoria Peak vista." \
  "yes"

# Clip 2 - Bucharest (Henrik refs: YES)
generate_clip "clip-02-bucharest" \
  "Medium-wide shot, golden afternoon, Bucharest. The Palace of the Parliament, a colossal rectangular limestone block with hundreds of identical arched windows in rigid symmetrical rows, wide Boulevard of the Union below. A man in a tailored black suit and white shirt strides along the stone balcony, champagne in hand, glancing across the grand plaza. Slow camera orbit with the massive building filling the frame. Showcasing Bucharest monumental parliament." \
  "yes"

# Clip 2b - Berlin TV Tower (Henrik refs: YES)
generate_clip "clip-2b-berlin-tv-tower" \
  "Wide shot, Alexanderplatz Berlin at blue hour. The Fernsehturm, its distinctive mirrored sphere and red-white antenna, rises against deep twilight. Weltzeituhr world clock in the foreground plaza. A man in a white suit strides across rain-slicked stone toward camera, one hand in trouser pocket, city lights reflecting in puddles around him. Slow tracking shot at waist height. Showcasing unmistakable Berlin identity." \
  "yes"

# Clip 6 - Beirut Airplane (Henrik refs: YES)
generate_clip "clip-06-beirut" \
  "Medium shot, first-class airplane cabin. A man in a white shirt, top button open, no jacket, seated at the window with champagne flute. Smiles warmly, then gazes relaxed through the oval window. Camera pushes past him revealing Beirut flat Mediterranean coast below, dense white Hamra district, Raouche Pigeon Rocks at sea level, snow-capped Mount Lebanon beyond. Showcasing authentic Beirut arrival." \
  "yes"

# Clip 7 - Mykonos Woman (NO Henrik refs)
generate_clip "clip-07-mykonos-woman" \
  "Medium shot, golden sunset, Zuma Mykonos infinity pool terrace. White Cycladic stone architecture, deep blue Aegean Sea to the horizon. A woman in a flowing white beach dress, seen from behind, stands at the pool edge facing the sunset, cocktail glass in her right hand, warm breeze moving her hair and dress. Camera tracks slowly along the pool edge at low level. Showcasing Mediterranean desire and elegance." \
  "no"

# Clip 8 - Lofoten Drone (NO Henrik refs)
generate_clip "clip-08-lofoten-drone" \
  "Aerial drone shot, bright Arctic summer light. Camera soars over the jagged granite peaks of Reinebringen, Lofoten Islands Norway. Deep blue Reinefjorden stretches far below, iconic red rorbuer fishing cabins dot the shoreline of Reine village. Camera sweeps across the dramatic panorama of sharp peaks, still fjord water, green slopes meeting dark rock. Showcasing one of Norway most breathtaking coastal landscapes." \
  "no"

# Clip 12 - Dubai (Henrik refs: YES)
generate_clip "clip-12-dubai" \
  "Medium-wide shot, night, luxury rooftop terrace, Downtown Dubai. The Burj Khalifa towers prominently, illuminated against dark sky, Dubai Fountain plaza below. A man in a smart dark suit walks into frame from the right, pauses at the glass railing, tilts his head upward gazing at the tower peak. Camera follows his gaze, slowly tilting up toward the illuminated spire. City lights shimmer below. Showcasing Dubai iconic skyline." \
  "yes"

# Clip 10 - Berlin Club CLOSING (Henrik refs: YES)
generate_clip "clip-10-berlin-club-closing" \
  "Medium shot, dark concrete corridor, Kraftwerk Berlin. A man in a white suit, top button open, pushes open a heavy steel door, champagne in other hand, confident grin. Green and red lasers and haze spill from the nightclub beyond. He steps through into the vast warehouse dance floor among silhouetted dancers, then the heavy door slowly swings shut behind him. Showcasing Kraftwerk legendary underground finale." \
  "yes"

# Insert A - HK Drone Panorama (NO Henrik refs)
generate_clip "insert-a-hk-drone" \
  "Aerial drone shot rushing forward over Victoria Peak at dusk, Hong Kong. Neon-lit glass towers reflect amber light, harbour water shimmers between Kowloon and Hong Kong Island. Camera accelerates into a dramatic sweeping reveal of the full skyline, Bank of China Tower and IFC prominent against orange sky. Warm blue and amber cinematic tones. Showcasing Hong Kong legendary harbour panorama." \
  "no"

# Insert B - Private Dining (NO Henrik refs)
generate_clip "insert-b-private-dining" \
  "Medium shot, intimate private dining room, warm amber candlelight. Long table set with crystal glassware, white linen, fresh flowers. Well-dressed guests in elegant evening wear raise glasses in a toast, genuine laughter and warm conversation. Camera slowly dollies along the table. Golden light, shallow depth of field on flickering candles. Showcasing exclusive luxury dining atmosphere." \
  "no"

# Insert C - Rooftop Bar (NO Henrik refs)
generate_clip "insert-c-rooftop-bar" \
  "Wide shot, sleek rooftop bar at night, glittering skyline beyond. Well-dressed guests mingle around a backlit marble bar, cocktails in hand, relaxed laughter. Warm string lights overhead, ambient golden glow. Camera tracks slowly through the scene at shoulder height, shallow depth of field, bokeh city lights in background. Showcasing sophisticated luxury nightlife energy." \
  "no"

echo ""
echo "=== COMPLETE ==="
echo "All clips saved to: $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR"/*.mp4 2>/dev/null || echo "No .mp4 files found (check errors above)"
