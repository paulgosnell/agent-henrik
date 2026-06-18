#!/usr/bin/env node
/**
 * Agent Henrik - Hero Video Veo Generator
 *
 * Ports the proven AccountsOS Veo 3.1 pipeline (lib/veo/client.ts) into a
 * standalone batch script. Uses Google Veo 3.1 via the Gemini Generative
 * Language API with reference images for Henrik face/identity preservation.
 *
 * Why Veo over Grok: reference_images with referenceType "asset" preserves
 * the subject (Henrik) across clips far more reliably than Grok Imagine.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/generate-veo-videos.mjs [clipName ...]
 *   (no clip names => generates every clip defined below)
 *
 * Output: ~/Downloads/hero-veo-clips/<name>.mp4
 *
 * Notes:
 *   - Veo 3.1 produces fixed ~8s clips (duration param ignored). Trim in player.
 *   - Aspect ratios limited to 16:9 / 9:16 / 1:1.
 *   - "lite" model does NOT support reference images; we use "fast".
 *   - Gemini file URIs expire ~2 days, so we download immediately.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "veo-3.1-fast-generate-preview"; // supports reference images
const OUTPUT_DIR = join(homedir(), "Downloads", "hero-veo-clips");

const SUPABASE_URL = "https://fjnfsabvuiyzuzfhxzcc.supabase.co";
const REF_URLS = [1, 2, 3].map(
  (n) => `${SUPABASE_URL}/storage/v1/object/public/media/henrik-ref-${n}.jpg`
);

// Appended to every prompt. The Gemini API rejects `negativePrompt` when
// reference images are used, so we steer in-prompt instead.
const CLEAN_SUFFIX =
  " No on-screen text, no subtitles, no captions, no watermarks, no logos.";

function getKey() {
  const raw = process.env.GEMINI_API_KEY;
  if (!raw) throw new Error("GEMINI_API_KEY not set");
  return raw.trim().replace(/\\n$/, "");
}

async function fetchReferenceImages() {
  const refs = [];
  for (const url of REF_URLS) {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  WARN: reference image ${url} -> HTTP ${res.status}, skipping`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    refs.push({
      bytesBase64Encoded: buf.toString("base64"),
      mimeType: "image/jpeg",
    });
  }
  if (!refs.length) throw new Error("No reference images could be fetched");
  return refs;
}

async function startVeo({ prompt, referenceImages, aspectRatio = "16:9" }) {
  const instance = { prompt: prompt + CLEAN_SUFFIX };
  if (referenceImages?.length) {
    instance.referenceImages = referenceImages.map((img) => ({
      image: {
        bytesBase64Encoded: img.bytesBase64Encoded,
        mimeType: img.mimeType,
      },
      referenceType: "asset",
    }));
  }
  const body = {
    instances: [instance],
    parameters: { aspectRatio },
  };

  const res = await fetch(`${BASE}/models/${MODEL}:predictLongRunning?key=${getKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => null);
  if (!res.ok || !j?.name) {
    throw new Error(j?.error?.message || `Veo HTTP ${res.status}`);
  }
  return j.name;
}

async function pollVeo(opName) {
  const res = await fetch(`${BASE}/${opName}?key=${getKey()}`);
  const j = await res.json();
  if (j.error) return { done: true, error: j.error.message };
  if (!j.done) return { done: false };

  const r = j.response?.generateVideoResponse;
  if (r?.raiMediaFilteredCount && r.raiMediaFilteredReasons?.length) {
    return { done: true, error: r.raiMediaFilteredReasons[0] || "Filtered by Veo safety filter" };
  }
  const uri = r?.generatedSamples?.[0]?.video?.uri;
  if (!uri) return { done: true, error: "Veo returned no video URI" };
  return { done: true, videoUri: uri };
}

async function waitForVeo(opName, { timeoutMs = 300_000, intervalMs = 8_000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const r = await pollVeo(opName);
    if (r.done) return r;
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return { done: false, error: "Veo polling timed out" };
}

async function downloadVeoVideo(uri) {
  const res = await fetch(uri, { headers: { "x-goog-api-key": getKey() } });
  if (!res.ok) throw new Error(`Veo download failed: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function generateClip(clip, referenceImages) {
  console.log(`\n>>> ${clip.name}`);
  const refs = clip.useRefs ? referenceImages : undefined;
  process.stdout.write("  submitting...");
  const opName = await startVeo({ prompt: clip.prompt, referenceImages: refs });
  process.stdout.write(" polling");
  const result = await waitForVeo(opName);
  console.log("");
  if (result.error) {
    console.error(`  FAILED: ${result.error}`);
    return false;
  }
  const bytes = await downloadVeoVideo(result.videoUri);
  const path = join(OUTPUT_DIR, `${clip.name}.mp4`);
  await writeFile(path, bytes);
  console.log(`  Done -> ${path} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
  return true;
}

// ============================================================
// CLIP DEFINITIONS — Henrik's final round (20 May 2026)
// Only the 4 AI-regeneration clips. Stock swaps (HK, Lofoten,
// Sao Paulo) and the Dinner Toast deletion are edit-only.
// ============================================================
const CLIPS = [
  {
    name: "clip-10-berlin-club-closing",
    useRefs: true,
    // Henrik: "address camera movement and correct the avatar". Door opens
    // naturally: hinged on the right, handle on the left, swinging away from him.
    prompt:
      "Cinematic tracking shot gliding smoothly behind a man as he walks down a dark " +
      "concrete corridor inside an industrial Berlin nightclub. The man from the reference " +
      "image wears a white dinner jacket with the top button open. He reaches a single heavy " +
      "steel door that is hinged on the right side with its handle on the left; he pushes the " +
      "handle and the door swings open smoothly away from him, pivoting on its right-hand " +
      "hinges, revealing the cavernous warehouse dance floor beyond filled with green and red " +
      "laser light and atmospheric haze. He steps through into a crowd of silhouetted dancers, " +
      "then glances back over his shoulder toward the camera with a confident look. Moody " +
      "underground atmosphere, volumetric haze, cinematic colour grade, shallow depth of field.",
  },
  {
    name: "clip-00-factory-opening",
    useRefs: true,
    // Henrik: "fix the AI generation error (the door), add camera movement, not static"
    prompt:
      "Slow cinematic dolly-in toward a man standing in the vast main hall of Kraftwerk " +
      "Berlin, towering raw concrete walls and steel beams, dramatic shafts of light cutting " +
      "through haze. The man from the reference image wears a white dinner jacket and black " +
      "bow tie, holding a champagne glass in his right hand, a knowing smile. He beckons with " +
      "his left hand in a follow-me gesture, then turns and strides confidently into the dark " +
      "industrial depths. Smooth forward camera movement following him. Raw underground grandeur, " +
      "cinematic colour grade.",
  },
  {
    name: "clip-2b-berlin-tv-tower",
    useRefs: true,
    // Henrik: "remove the clock" (no Weltzeituhr world clock)
    prompt:
      "Smooth tracking shot at waist height following a man walking toward camera across a " +
      "rain-slicked stone plaza at Alexanderplatz Berlin at blue hour. The man from the " +
      "reference image wears a white suit, one hand in his trouser pocket. Behind him the " +
      "Fernsehturm television tower rises against deep twilight, its mirrored sphere and " +
      "red-and-white antenna glowing, city lights reflecting in puddles. Empty plaza with no " +
      "clock and no monuments. Cinematic colour grade, shallow depth of field.",
  },
  {
    name: "clip-05-cox-bay",
    useRefs: true,
    // Henrik: "remove the bowtie"
    prompt:
      "Cinematic slow tracking shot of a man walking along the wide sandy beach at Cox Bay, " +
      "Vancouver Island, at golden hour. The man from the reference image wears an open-collar " +
      "white linen shirt with no tie and no bow tie, sleeves loosely rolled. Mist over the " +
      "Pacific surf behind him, dark forested headlands in the distance. He gazes out toward " +
      "the ocean as the camera glides alongside him. Warm natural light, cinematic colour grade.",
  },
];

async function main() {
  const wanted = process.argv.slice(2);
  const clips = wanted.length
    ? CLIPS.filter((c) => wanted.includes(c.name))
    : CLIPS;

  if (!clips.length) {
    console.error("No matching clips. Available:");
    CLIPS.forEach((c) => console.error(`  ${c.name}`));
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`=== Agent Henrik Veo Generator (${MODEL}) ===`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Clips: ${clips.map((c) => c.name).join(", ")}`);

  console.log("\nFetching Henrik reference images...");
  const referenceImages = await fetchReferenceImages();
  console.log(`  ${referenceImages.length} reference image(s) loaded.`);

  let ok = 0;
  for (const clip of clips) {
    try {
      if (await generateClip(clip, referenceImages)) ok++;
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }
  console.log(`\n=== Done: ${ok}/${clips.length} clips generated ===`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
