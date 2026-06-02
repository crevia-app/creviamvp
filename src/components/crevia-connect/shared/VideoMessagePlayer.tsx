import { useRef, useState } from "react";
import { Play, Pause, Download, AlertCircle } from "lucide-react";

interface VideoMessagePlayerProps {
  src: string;
  fileType: string | null;
  onDownload: () => void;
}

/**
 * VideoMessagePlayer
 *
 * Self-contained video bubble for chat messages.
 * - No default browser controls — custom play/pause overlay
 * - object-cover fills the rounded container, no letterboxing
 * - <source type> tells the browser the exact codec upfront,
 *   fixing the black screen on iOS when receiving WebM from Android
 * - onError fallback shows a download button when the browser
 *   can't decode the format (e.g. iOS Safari + WebM)
 */
export function VideoMessagePlayer({ src, fileType, onDownload }: VideoMessagePlayerProps) {
  const videoRef              = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [errored, setErrored] = useState(false);

  // Normalise MIME type — default mp4 for maximum cross-browser compatibility.
  // This is the critical fix: without an explicit type, iOS Safari cannot
  // determine the codec and renders a black frame for non-native formats.
  const mimeType = fileType?.startsWith("video/") ? fileType : "video/mp4";

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().catch(() => setErrored(true));
      setPlaying(true);
    }
  };

  // Format-incompatible fallback (e.g. iOS Safari receiving WebM)
  if (errored) {
    return (
      <div className="w-full max-w-[280px] sm:max-w-sm rounded-xl bg-black/60 flex flex-col items-center justify-center gap-2 py-6">
        <AlertCircle className="h-6 w-6 text-white/40" />
        <p className="text-[11px] text-white/50">Can't play this format</p>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-[280px] sm:max-w-sm rounded-xl overflow-hidden bg-black cursor-pointer"
      style={{ aspectRatio: "16 / 9" }}
      onClick={togglePlay}
    >
      {/* Video — no controls, object-cover fills the bubble */}
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={() => setPlaying(false)}
        onError={() => setErrored(true)}
      >
        {/* Explicit type attribute fixes black screen: browser knows the
            codec immediately without having to sniff the byte stream */}
        <source src={src} type={mimeType} />
      </video>

      {/* Play overlay — shown when paused */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Pause overlay — visible on hover/tap while playing */}
      {playing && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity duration-150 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Pause className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
      )}
    </div>
  );
}
