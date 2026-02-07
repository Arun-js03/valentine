"use client";

import React, { useEffect, useState } from "react";

const HeartCanvas = () => {
  const [hearts, setHearts] = useState<
    {
      id: number;
      left: string;
      size: string;
      duration: string;
      delay: string;
    }[]
  >([]);

  useEffect(() => {
    // Generate random hearts on mount
    const newHearts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * (30 - 10) + 10}px`,
      duration: `${Math.random() * (15 - 5) + 5}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="animate-float-up absolute text-pink-300 opacity-60"
          style={{
            left: heart.left,
            fontSize: heart.size,
            bottom: "-50px",
            animationDuration: heart.duration,
            animationDelay: heart.delay,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
          }}
        >
          ❤️
        </div>
      ))}

      <style jsx global>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation-name: float-up;
        }
      `}</style>
    </div>
  );
};

export default HeartCanvas;
