"use client";

import React, { useState, useEffect, useRef } from "react";
import HeartCanvas from "@/components/HeartCanvas";
import VoiceRecorder from "@/components/VoiceRecorder";
import emailjs from "@emailjs/browser";
import confetti from "canvas-confetti";

const TEASING_MESSAGES = [
  "Think again 🙂",
  "This could be a mistake!",
  "Are you sure? 😏",
  "Oops… missed me!",
  "Nice try 😜",
  "Wait, why? 🥺",
  "Error: Button shy 🙈",
  "Try the other one! 👉",
];

export default function Page() {
  const [isAccepted, setIsAccepted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: -100, y: -100 }); // Start off-screen/hidden initially
  const [isNoButtonMoved, setIsNoButtonMoved] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isMeasured, setIsMeasured] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLDivElement>(null);

  // Initialize the NO button position to be near the YES button
  useEffect(() => {
    if (cardRef.current && !isNoButtonMoved && !isMeasured) {
      // We'll set an initial position that looks good in the layout
      // Instead of relying on flex, we'll place it absolutely
      const cardWidth = cardRef.current.offsetWidth;
      const cardHeight = cardRef.current.offsetHeight;

      // Initial position: centered horizontally, but shifted right of the center
      // and placed near the bottom where the actions usually are
      setNoButtonPos({
        x: cardWidth / 2 + 20,
        y: cardHeight - 120,
      });
      setIsMeasured(true);
    }
  }, [isMeasured, isNoButtonMoved]);

  const moveNoButton = () => {
    if (!cardRef.current || !noButtonRef.current) return;

    const card = cardRef.current.getBoundingClientRect();
    const button = noButtonRef.current.getBoundingClientRect();
    const padding = 24;

    // Calculate max boundaries within the card
    const maxX = card.width - button.width - padding;
    const maxY = card.height - button.height - padding;

    // Generate random coordinates relative to the card
    const randomX = Math.max(padding, Math.random() * maxX);
    const randomY = Math.max(padding, Math.random() * maxY);

    setNoButtonPos({ x: randomX, y: randomY });
    setIsNoButtonMoved(true);

    // Pick a random message
    const msg =
      TEASING_MESSAGES[Math.floor(Math.random() * TEASING_MESSAGES.length)];
    setCurrentMessage(msg);
  };

  const handleYesClick = () => {
    setIsAccepted(true);

    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3"
    );
    audio.play().catch(() => {});

    triggerConfetti();
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff69b4", "#ff1493", "#ffe4e1"],
    });

    // Ongoing confetti for a few seconds
    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ff69b4", "#ff1493", "#ffe4e1"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ff69b4", "#ff1493", "#ffe4e1"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Effect to handle email sending when accepted
  useEffect(() => {
    if (isAccepted) {
      // Small delay to ensure UI updates first (mobile optimization)
      const timer = setTimeout(() => {
        sendEmailNotification();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAccepted]);

  const sendEmailNotification = async () => {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    // console.log("Attempting to send email...");
    // console.log("Service ID:", serviceId ? "Present" : "Missing");
    // console.log("Template ID:", templateId ? "Present" : "Missing");
    // console.log("Public Key:", publicKey ? "Present" : "Missing");

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS keys are missing. Email not sent.");
      alert("Error: EmailJS keys are missing in .env.local");
      return;
    }

    try {
      // Initialize EmailJS with public key (optional but good practice)
      // emailjs.init(publicKey);

      const templateParams = {
        to_email: "arunjs2703@gmail.com",
        message:
          "Sanjana clicked YES 🥰\nYour Valentine proposal was accepted 💕\nThis message was sent automatically when the YES button was clicked.",
        from_name: "Valentine App",
      };

      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey // Pass public key as 4th argument
      );

      console.log("Email sent successfully!", response.status, response.text);
      alert("Email sent successfully! 💌");
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Check console for details.");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#FFF0F5] to-[#FFE4E1] p-4 font-sans">
      <HeartCanvas />

      {!isAccepted ? (
        <div
          ref={cardRef}
          className="animate-in fade-in zoom-in relative z-10 flex min-h-[500px] w-full max-w-md flex-col justify-start overflow-hidden rounded-[2.5rem] border border-pink-100 bg-white/95 p-8 pt-16 text-center shadow-[0_20px_50px_rgba(255,182,193,0.3)] backdrop-blur-md transition-all duration-700 md:p-12"
        >
          <div className="animate-bounce-slow mb-6 text-7xl">💝</div>
          <h1 className="mb-4 bg-linear-to-r from-pink-500 to-rose-600 bg-clip-text text-3xl leading-tight font-black text-transparent md:text-4xl">
            Sanjana, will you be my Valentine? 💖💞
          </h1>
          <p className="mb-10 text-lg font-medium text-gray-400 italic">
            Choose wisely. (The ‘No’ button is… shy.)
          </p>

          <div className="mt-4 flex justify-start">
            <button
              onClick={handleYesClick}
              className="animate-pulse-gentle z-20 rounded-full bg-linear-to-r from-pink-500 to-rose-500 px-10 py-4 text-xl font-bold text-white shadow-[0_10px_20px_rgba(244,63,94,0.3)] transition-all duration-300 hover:scale-110 hover:shadow-pink-300 active:scale-95"
              style={{
                transform: !isNoButtonMoved ? "translateX(-60px)" : "none",
              }}
            >
              YES! 💖
            </button>
          </div>

          {/* The "No" Button and its Message Container - Absolute positioned relative to card */}
          <div
            ref={noButtonRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate3d(${noButtonPos.x}px, ${noButtonPos.y}px, 0)`,
              transition: isNoButtonMoved
                ? "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                : "none",
              zIndex: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "auto",
            }}
          >
            {/* Teasing Message - positioned above the button */}
            <div
              key={currentMessage}
              className={`animate-fade-in-up mb-2 text-sm font-bold whitespace-nowrap text-pink-500`}
              style={{ opacity: isNoButtonMoved ? 1 : 0 }}
            >
              {currentMessage}
            </div>

            <button
              onMouseEnter={moveNoButton}
              onClick={moveNoButton}
              className="rounded-full border border-pink-500 bg-white px-8 py-3 text-lg font-semibold text-gray-400 shadow-sm transition-all duration-300 hover:bg-gray-50 active:scale-90"
            >
              No
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-card-appear relative z-20 flex w-full max-w-sm flex-col items-center overflow-visible rounded-[2.5rem] border-2 border-pink-50 bg-white p-8 text-center shadow-[0_25px_60px_rgba(255,105,180,0.25)] transition-all md:p-10">
          {/* Floating Heart above the couple */}
          <div className="animate-bounce-slow absolute -top-6 left-1/2 -translate-x-1/2 text-5xl drop-shadow-md filter">
            ❤️
          </div>

          <h2 className="mt-4 mb-6 bg-linear-to-r from-pink-500 to-rose-600 bg-clip-text text-4xl font-black text-transparent">
            💖 YAY!!! 💖
          </h2>

          <div className="relative mx-auto mb-6 flex aspect-square w-full max-w-[280px] items-center justify-center overflow-hidden rounded-3xl border-4 border-pink-100 bg-pink-50 shadow-lg">
            <img
              src="couple-gif.gif"
              alt="Romantic couple"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
            />
          </div>

          <p className="animate-pulse-gentle mt-4 text-3xl font-extrabold text-rose-500">
            I love you ❤️
          </p>

          {/* <VoiceRecorder /> */}
        </div>
      )}

      {/* Background Hearts Animation for Success */}
      {isAccepted && (
        <div className="pointer-events-none fixed inset-0 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="animate-float-up absolute text-4xl opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: "-10%",
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              {["❤️", "💖", "💝", "💕", "🥰"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes custom-confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-120vh) scale(1.2);
            opacity: 0;
          }
        }
        @keyframes card-appear {
          0% {
            transform: scale(0.8) translateY(40px);
            opacity: 0;
          }
          60% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(-10%) translateX(-50%);
          }
          50% {
            transform: translateY(10%) translateX(-50%);
          }
        }
        @keyframes pulse-gentle {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float-up {
          animation: float-up ease-in forwards;
        }
        .animate-card-appear {
          animation: card-appear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 1.5s infinite ease-in-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
