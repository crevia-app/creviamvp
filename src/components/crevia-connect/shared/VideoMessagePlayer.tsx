import { useRef, useState } from "react";
import { Play, Pause, Download, AlertCircle, Maximize2 } from "lucide-react";

interface VideoMessagePlayerProps {
  src: string;
  fileType: string | null;
  onDownload: () => void;
  onExpand?: () => void;
}

export function VideoMessagePlayer({ src, fileType, onDownload, onExpand }: VideoMessagePlayerProps) {
  const videoRef             = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [errored, setErrored] = useState(false);

  const mimeType = fileType?.startsWith("video/") ? fileType : "video/mp4";

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    playing ? video.pause() : video.play().catch(() => setErrored(true));
  };

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
    <div className="relative group/video w-full max-w-[280px] sm:max-w-sm rounded-xl overflow-hidden bg-black min-h-[160px]">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="w-full block"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setErrored(true)}
        onLoadedData={() => {
          if (videoRef.current && videoRef.current.videoWidth === 0) setErrored(true);
        }}
      >
        <source src={src} type={mimeType} />
      </video>

      {/* Single custom center play/pause — z-10 sits above the native shadow-DOM
          center button so only one play icon is ever visible. Positioned above
          the native controls bar (bottom-10 ≈ 40px clearance). Identical for
          sender and receiver — no isMine conditional anywhere. */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 bottom-10 z-10 flex items-center justify-center bg-transparent"
        aria-label={playing ? "Pause" : "Play"}
      >
        <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
          {playing
            ? <Pause className="w-6 h-6 text-white fill-white" />
            : <Play  className="w-6 h-6 text-white fill-white ml-1" />
          }
        </div>
      </button>

      {/* Expand — top-right, always above the play button */}
      {onExpand && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); onExpand(); }}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onExpand(); }}
          className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/90 rounded-full text-white backdrop-blur-md transition-all active:scale-95 touch-manipulation flex items-center justify-center"
          style={{ width: 44, height: 44 }}
          aria-label="Expand video"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
