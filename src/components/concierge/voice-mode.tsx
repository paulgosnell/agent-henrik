"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Phone, Loader2 } from "lucide-react";
import type { ConversationMessage } from "@/lib/supabase/types";

type VoiceState = "idle" | "connecting" | "listening" | "processing" | "speaking";

interface VoiceModeProps {
  onEnd: (transcript: ConversationMessage[]) => void;
  sessionId: string;
  context?: {
    storyworld_id?: string;
    theme_id?: string;
    storyteller_id?: string;
  };
}

export function VoiceMode({ onEnd, sessionId, context }: VoiceModeProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<ConversationMessage[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    playbackQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  function base64ToInt16Array(base64: string): Int16Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Int16Array(bytes.buffer);
  }

  function int16ToFloat32(int16: Int16Array): Float32Array {
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    return float32;
  }

  async function playAudioChunk(data: Int16Array) {
    playbackQueueRef.current.push(data);
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    while (playbackQueueRef.current.length > 0) {
      const chunk = playbackQueueRef.current.shift()!;
      const ctx = audioContextRef.current;
      if (!ctx) break;

      const float32 = int16ToFloat32(chunk);
      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(new Float32Array(float32.buffer.slice(0)) as Float32Array<ArrayBuffer>, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();

      await new Promise<void>((resolve) => {
        source.onended = () => resolve();
      });
    }

    isPlayingRef.current = false;
    if (state === "speaking") {
      setState("listening");
    }
  }

  async function startSession() {
    setError(null);
    setState("connecting");

    try {
      // Get mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Get ephemeral token
      const tokenRes = await fetch("/api/realtime-session", { method: "POST" });
      if (!tokenRes.ok) throw new Error("Failed to get session token");
      const tokenData = await tokenRes.json();
      const clientSecret = tokenData.client_secret?.value;
      if (!clientSecret) throw new Error("No client secret received");

      // Create audio context
      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      // Connect to WebSocket
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`,
        ["realtime", `openai-insecure-api-key.${clientSecret}`, "openai-beta.realtime-v1"]
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setState("listening");

        // Start sending audio
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          // Resample from audioCtx.sampleRate to 24000
          const ratio = audioCtx.sampleRate / 24000;
          const outputLength = Math.floor(inputData.length / ratio);
          const int16 = new Int16Array(outputLength);
          for (let i = 0; i < outputLength; i++) {
            const idx = Math.floor(i * ratio);
            int16[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[idx] * 32768)));
          }
          const uint8 = new Uint8Array(int16.buffer);
          let binary = "";
          for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          const base64 = btoa(binary);
          ws.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64,
          }));
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
      };

      let currentAssistantText = "";

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "response.audio.delta":
            setState("speaking");
            if (msg.delta) {
              const audioData = base64ToInt16Array(msg.delta);
              playAudioChunk(audioData);
            }
            break;

          case "response.audio_transcript.delta":
            currentAssistantText += msg.delta || "";
            setCurrentText(currentAssistantText);
            break;

          case "response.audio_transcript.done":
            if (currentAssistantText) {
              setTranscript((prev) => [...prev, { role: "assistant", content: currentAssistantText }]);
              currentAssistantText = "";
              setCurrentText("");
            }
            break;

          case "conversation.item.input_audio_transcription.completed":
            if (msg.transcript) {
              setTranscript((prev) => [...prev, { role: "user", content: msg.transcript }]);
            }
            break;

          case "input_audio_buffer.speech_started":
            setState("listening");
            break;

          case "input_audio_buffer.speech_stopped":
            setState("processing");
            break;

          case "error":
            console.error("Realtime error:", msg.error);
            setError(msg.error?.message || "Connection error");
            break;
        }
      };

      ws.onerror = () => {
        setError("Connection failed");
        cleanup();
        setState("idle");
      };

      ws.onclose = () => {
        if (state !== "idle") {
          setState("idle");
        }
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start voice mode";
      if (message.includes("Permission denied") || message.includes("NotAllowedError")) {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else {
        setError(message);
      }
      cleanup();
      setState("idle");
    }
  }

  function endSession() {
    cleanup();
    setState("idle");

    // Save transcript
    if (transcript.length > 0) {
      fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: transcript,
          context,
          sessionId,
          saveOnly: true,
        }),
      }).catch(() => {});

      onEnd(transcript);
    }
  }

  const stateLabels: Record<VoiceState, string> = {
    idle: "Start Voice Mode",
    connecting: "Connecting...",
    listening: "Listening...",
    processing: "Processing...",
    speaking: "Speaking...",
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Status */}
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {stateLabels[state]}
      </p>

      {/* Main button */}
      {state === "idle" ? (
        <button
          onClick={startSession}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
          aria-label="Start voice mode"
        >
          <Mic size={24} />
        </button>
      ) : state === "connecting" ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <button
          onClick={endSession}
          className={`flex h-16 w-16 items-center justify-center rounded-full transition-transform hover:scale-105 ${
            state === "listening"
              ? "bg-red-500 text-white animate-pulse"
              : state === "speaking"
                ? "bg-blue-500 text-white"
                : "bg-yellow-500 text-white"
          }`}
          aria-label="End voice mode"
        >
          {state === "listening" ? (
            <MicOff size={24} />
          ) : (
            <Phone size={24} />
          )}
        </button>
      )}

      {/* Live transcript */}
      {currentText && (
        <p className="max-w-xs text-center text-sm text-muted-foreground italic">
          {currentText}
        </p>
      )}

      {/* Transcript history */}
      {transcript.length > 0 && (
        <div className="w-full max-w-xs space-y-2 max-h-40 overflow-y-auto">
          {transcript.slice(-4).map((msg, i) => (
            <p key={i} className={`text-xs ${msg.role === "user" ? "text-right text-foreground" : "text-left text-muted-foreground"}`}>
              {msg.content.slice(0, 100)}{msg.content.length > 100 ? "..." : ""}
            </p>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 text-center max-w-xs">{error}</p>
      )}

      {/* End button when active */}
      {state !== "idle" && state !== "connecting" && (
        <button
          onClick={endSession}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          End conversation
        </button>
      )}
    </div>
  );
}
