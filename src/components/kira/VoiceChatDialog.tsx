import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useVoiceChat } from "@/hooks/use-voice-chat";
import { Mic, MicOff, Volume2, VolumeX, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { cn } from "@/lib/utils";

interface VoiceChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'creator' | 'brand' | null;
  projectContext?: {
    name: string;
    description: string | null;
    customInstructions: string | null;
  } | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const VoiceChatDialog = ({
  open,
  onOpenChange,
  userType,
  projectContext,
}: VoiceChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [autoListen, setAutoListen] = useState(true);

  const sendToKira = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kira-chat`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userType: userType || 'creator',
          projectContext,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to Kira");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (assistantContent) {
        // Speak the response
        speak(assistantContent);
      }
    } catch (error) {
      console.error("Voice chat error:", error);
      const errorMsg = "Sorry, I had a little trouble hearing that. Could you try again?";
      setMessages([...newMessages, { role: "assistant", content: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, userType, projectContext]);

  const handleTranscript = useCallback((text: string) => {
    setCurrentTranscript("");
    sendToKira(text);
  }, [sendToKira]);

  const handleSpeakEnd = useCallback(() => {
    // Auto-start listening after Kira finishes speaking
    if (autoListen && open) {
      setTimeout(() => {
        startListening();
      }, 500);
    }
  }, [autoListen, open]);

  const {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    transcript,
  } = useVoiceChat({
    onTranscript: handleTranscript,
    onSpeakEnd: handleSpeakEnd,
  });

  useEffect(() => {
    if (transcript) {
      setCurrentTranscript(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (open && isSupported) {
      // Initial greeting
      const greeting = userType === 'brand' 
        ? "Hey! I'm Kira. How can I help with your campaign today?"
        : "Hey! I'm Kira. What would you like to work on today?";
      setMessages([{ role: "assistant", content: greeting }]);
      speak(greeting);
    } else if (!open) {
      setMessages([]);
      stopSpeaking();
      stopListening();
    }
  }, [open, isSupported, userType]);

  if (!isSupported) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Chat Unavailable</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Your browser doesn't support voice features. Please try using Chrome, Safari, or Edge.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-bronze/10 to-bronze-dark/10">
           <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold">Voice Chat with Kira</h3>
              <p className="text-xs text-muted-foreground">
                {isSpeaking ? "Speaking..." : isListening ? "Listening..." : isProcessing ? "Thinking..." : "Tap mic to speak"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat Display */}
        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-muted/30">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                  msg.role === "user"
                    ? "bg-bronze text-background rounded-tr-md"
                    : "bg-card border border-border/50 rounded-tl-md"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {currentTranscript && (
            <div className="flex flex-row-reverse gap-2">
              <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-bronze/50 text-background rounded-tr-md italic">
                {currentTranscript}...
              </div>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex gap-2">
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-md px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-bronze" />
              </div>
            </div>
          )}
        </div>

        {/* Voice Orb Controls */}
        <div className="p-6 bg-background flex flex-col items-center gap-4">
          {/* Animated Voice Orb */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking || isProcessing}
            className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center transition-all",
              isListening
                ? "bg-gradient-to-br from-bronze to-bronze-dark shadow-lg shadow-bronze/30"
                : isSpeaking
                ? "bg-gradient-to-br from-bronze/50 to-bronze-dark/50"
                : "bg-muted hover:bg-muted/80 border-2 border-border/50 hover:border-bronze/50",
              (isSpeaking || isProcessing) && "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Pulsing rings when listening */}
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-bronze/30 animate-ping" />
                <span className="absolute inset-[-8px] rounded-full border-2 border-bronze/20 animate-pulse" />
              </>
            )}
            
            {/* Speaking waves */}
            {isSpeaking && (
              <span className="absolute inset-[-8px] rounded-full border-2 border-bronze/40 animate-pulse" />
            )}
            
            {isListening ? (
              <Mic className="w-8 h-8 text-background relative z-10" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-background relative z-10" />
            ) : (
              <MicOff className="w-8 h-8 text-muted-foreground" />
            )}
          </button>

          <p className="text-sm text-muted-foreground text-center">
            {isListening 
              ? "Listening... Tap to stop" 
              : isSpeaking 
              ? "Kira is speaking..."
              : isProcessing
              ? "Processing your message..."
              : "Tap the microphone to speak"
            }
          </p>

          {/* Mute/Stop controls */}
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopSpeaking}
                className="gap-2"
              >
                <VolumeX className="w-4 h-4" />
                Stop Speaking
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoListen(!autoListen)}
              className={cn(
                "gap-2 text-xs",
                autoListen ? "text-bronze" : "text-muted-foreground"
              )}
            >
              {autoListen ? "Auto-listen: On" : "Auto-listen: Off"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
