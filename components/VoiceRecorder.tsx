"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Send,
  RotateCcw,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import emailjs from "@emailjs/browser";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mimeType, setMimeType] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Determine the best supported MIME type
  const getSupportedMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4", // Safari often prefers this
      "audio/ogg;codecs=opus",
      "", // Fallback to default
    ];
    for (const type of types) {
      if (type === "" || MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedType = getSupportedMimeType();
      setMimeType(supportedType);

      const options = supportedType ? { mimeType: supportedType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const type = supportedType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setIsSent(false);
    setError(null);
    setRecordingTime(0);
  };

  const sendRecording = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    // Use a generic extension, Cloudinary handles type detection
    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    formData.append("audio", audioBlob, `voice-message.${ext}`);

    try {
      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const publicUrl = data.url; // Cloudinary URL from API

        // Send Email with the link
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

        if (serviceId && templateId && publicKey) {
          await emailjs.send(
            serviceId,
            templateId,
            {
              to_email: "arunjs2703@gmail.com",
              from_name: "Valentine App",
              message: "You received a voice message! 🎤",
              audio_url: publicUrl, // Pass the URL to the template
              // Fallback text if template doesn't use audio_url specifically
              message_html: `You received a voice message! <br/> <a href="${publicUrl}">Click here to listen 🎤</a>`,
            },
            publicKey
          );
        }

        setIsSent(true);
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to upload");
      }
    } catch (err: any) {
      console.error("Upload/Send failed", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isSent) {
    return (
      <div className="animate-fade-in-up mt-8 flex flex-col items-center rounded-2xl border-2 border-green-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
          <CheckCircle2 size={32} />
        </div>
        <p className="text-xl font-bold text-green-600">
          Voice Message Sent! 💌
        </p>
        <p className="mt-1 text-sm text-gray-500">
          The email has been sent with your recording.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-sm rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-[0_10px_30px_rgba(255,105,180,0.15)] backdrop-blur-md transition-all">
      <h3 className="mb-4 flex items-center justify-center gap-2 text-lg font-bold text-gray-700">
        If you want, say something 🎙️
      </h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        {/* Recording State Visualization */}
        {isRecording ? (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="flex animate-pulse items-center gap-2 font-mono text-xl font-bold text-rose-500">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              {formatTime(recordingTime)}
            </div>

            <div className="flex h-12 w-full items-center justify-center gap-1">
              {/* Simple audio wave visualization simulation */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 animate-[bounce_1s_infinite] rounded-full bg-rose-400"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            <button
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-red-600"
            >
              <Square size={20} fill="currentColor" /> Stop Recording
            </button>
          </div>
        ) : !audioUrl ? (
          /* Initial State */
          <button
            onClick={startRecording}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-rose-500 text-white shadow-[0_4px_14px_0_rgba(255,105,180,0.39)] transition-transform hover:scale-110 active:scale-95"
          >
            <Mic size={32} />
          </button>
        ) : (
          /* Preview State */
          <div className="w-full space-y-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              preload="metadata"
              className="w-full"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={resetRecording}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw size={18} /> Retry
              </button>

              <button
                onClick={sendRecording}
                disabled={isUploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-500 px-4 py-2 font-bold text-white shadow-md hover:bg-pink-600 disabled:opacity-70"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
