import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

const VoiceRecorder = ({ onRecordingComplete, onCancel, isUploading }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [waveformValues, setWaveformValues] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);
      setWaveformValues([]);

      // Timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      // Waveform animation
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const normalized = Math.min(avg / 128, 1);
        setWaveformValues((prev) => [...prev.slice(-40), normalized]);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch {
      console.error("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleSend = useCallback(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration);
      setAudioBlob(null);
      setDuration(0);
      setWaveformValues([]);
    }
  }, [audioBlob, duration, onRecordingComplete]);

  const handleCancel = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setAudioBlob(null);
    setDuration(0);
    setWaveformValues([]);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    onCancel();
  }, [onCancel]);

  // Auto-start recording on mount
  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex items-center gap-2 w-full animate-in slide-in-from-bottom-2 duration-200">
      {/* Cancel */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCancel}
        className="h-10 w-10 text-destructive hover:bg-destructive/10 flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Waveform + timer */}
      <div className="flex-1 flex items-center gap-3 px-3 py-2 rounded-full bg-muted/60 border border-border/50">
        {/* Recording indicator */}
        <div className={cn(
          "w-2.5 h-2.5 rounded-full flex-shrink-0",
          isRecording ? "bg-red-500 animate-pulse" : "bg-muted-foreground/30"
        )} />

        {/* Waveform bars */}
        <div className="flex items-center gap-[2px] h-6 flex-1 overflow-hidden">
          {waveformValues.map((v, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-bronze/70 flex-shrink-0 transition-all duration-75"
              style={{ height: `${Math.max(4, v * 24)}px` }}
            />
          ))}
          {/* Fill remaining space with placeholder bars */}
          {waveformValues.length < 40 &&
            Array.from({ length: 40 - waveformValues.length }).map((_, i) => (
              <div key={`p-${i}`} className="w-[3px] h-1 rounded-full bg-muted-foreground/15 flex-shrink-0" />
            ))}
        </div>

        {/* Duration */}
        <span className="text-xs font-mono text-muted-foreground tabular-nums flex-shrink-0">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Stop / Send */}
      {isRecording ? (
        <Button
          onClick={stopRecording}
          size="icon"
          className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex-shrink-0"
        >
          <Square className="h-4 w-4 fill-current" />
        </Button>
      ) : audioBlob ? (
        <Button
          onClick={handleSend}
          disabled={isUploading}
          size="icon"
          className="h-10 w-10 rounded-full bg-bronze hover:bg-bronze/90 text-background flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
};

export default VoiceRecorder;
