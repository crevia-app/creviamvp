import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Max file size we'll attempt to convert client-side.
// Beyond this, transcoding would take several minutes on a phone.
export const VIDEO_CONVERT_MAX_BYTES = 200 * 1024 * 1024; // 200 MB

// Singleton — load FFmpeg WASM once, reuse across conversions.
let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<void> | null = null;

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;

  if (!loadPromise) {
    ffmpeg = new FFmpeg();
    // Load single-threaded core from CDN — no SharedArrayBuffer / COOP-COEP needed.
    loadPromise = (async () => {
      const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      ffmpeg!.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
      });
      // Wait for the internal load event
      await new Promise<void>((resolve, reject) => {
        ffmpeg!.on("log", () => {}); // keep listener alive
        // Poll until loaded
        const check = setInterval(() => {
          if (ffmpeg?.loaded) { clearInterval(check); resolve(); }
        }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error("FFmpeg load timeout")); }, 30_000);
      });
    })();
  }

  await loadPromise;
  return ffmpeg!;
}

export interface ConvertProgress {
  stage: "loading" | "converting";
  percent: number; // 0-100
}

/**
 * Convert any video file to a web-compatible H.264 MP4.
 * Works in Chrome, Firefox, Safari, iOS Safari, Android Chrome.
 */
export async function convertVideoToMp4(
  file: File,
  onProgress?: (p: ConvertProgress) => void
): Promise<File> {
  if (file.size > VIDEO_CONVERT_MAX_BYTES) {
    throw new Error(
      "Video is too large to convert on this device (max 200 MB). " +
      "Please trim it to under ~3 minutes and try again."
    );
  }

  onProgress?.({ stage: "loading", percent: 0 });
  const ff = await loadFFmpeg();
  onProgress?.({ stage: "loading", percent: 100 });

  ff.on("progress", ({ progress }) => {
    onProgress?.({ stage: "converting", percent: Math.min(99, Math.round(progress * 100)) });
  });

  const ext = file.name.split(".").pop()?.toLowerCase() || "mov";
  const inputName = `input.${ext}`;
  const outputName = "output.mp4";

  await ff.writeFile(inputName, await fetchFile(file));

  await ff.exec([
    "-i", inputName,
    "-c:v", "libx264",
    "-preset", "veryfast",  // fast encode, good quality
    "-crf", "23",           // quality factor (18=best, 28=acceptable)
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart", // moov atom at start = plays before fully downloaded
    "-y",
    outputName,
  ]);

  const data = await ff.readFile(outputName);
  const blob = new Blob([data as Uint8Array], { type: "video/mp4" });
  const outName = file.name.replace(/\.[^.]+$/, ".mp4");

  // Clean up internal FS to free memory for future conversions
  try { await ff.deleteFile(inputName); } catch { /* ignore */ }
  try { await ff.deleteFile(outputName); } catch { /* ignore */ }

  onProgress?.({ stage: "converting", percent: 100 });
  return new File([blob], outName, { type: "video/mp4" });
}

/** Returns true if the file needs conversion before it can play cross-browser. */
export function needsConversion(file: File): boolean {
  // mp4 with H.264 plays everywhere. Everything else is risky.
  // We convert all non-mp4 videos to be safe.
  return file.type.startsWith("video/") && file.type !== "video/mp4";
}
