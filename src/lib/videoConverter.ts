// Max file size we'll attempt to convert client-side.
// Beyond this, transcoding would take several minutes on a phone.
export const VIDEO_CONVERT_MAX_BYTES = 200 * 1024 * 1024; // 200 MB

// Singleton — load FFmpeg WASM once, reuse across conversions.
// FFmpeg type declared loosely to avoid a static import at module level.
let ffmpeg: any | null = null;
let loadPromise: Promise<void> | null = null;

async function loadFFmpeg(): Promise<any> {
  if (ffmpeg?.loaded) return ffmpeg;

  if (!loadPromise) {
    // Dynamic imports — FFmpeg JS + WASM only enter memory when a video
    // conversion is actually triggered, not on app startup.
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
      import("@ffmpeg/ffmpeg"),
      import("@ffmpeg/util"),
    ]);
    ffmpeg = new FFmpeg();
    loadPromise = (async () => {
      // Files are served from our own origin (copied from node_modules at build
      // time) and cached by the service worker after first load — no CDN dependency.
      await ffmpeg!.load({
        coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`/ffmpeg/ffmpeg-core.wasm`, "application/wasm"),
      });
    })();
  }

  // 120 s timeout — covers the first-ever load on a slow connection.
  // On every subsequent load the SW cache returns the file instantly.
  await Promise.race([
    loadPromise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("FFmpeg load timeout — check your connection and try again.")), 120_000)
    ),
  ]);

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

  const { fetchFile } = await import("@ffmpeg/util");
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
  // Convert ALL video files — including .mp4, because iPhone records mp4 in H.265/HEVC
  // which Chrome can't decode (shows black video, audio only). FFmpeg re-encodes to H.264
  // which plays everywhere. The extra pass on already-H.264 files is acceptable.
  return file.type.startsWith("video/");
}
