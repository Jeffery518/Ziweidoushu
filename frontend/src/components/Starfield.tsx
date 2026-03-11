"use client";

import React from "react";
import { motion } from "framer-motion";

export function StarField() {
  const stars = Array.from({ length: 150 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.7 + 0.3,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  }));

  const shootingStars = Array.from({ length: 3 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 15 + 5,
  }));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
      {/* Base deep space gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-900/10 via-zinc-950 to-black" />
      
      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white shadow-[0_0_8px_white]"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
          animate={{
            opacity: [star.opacity, 0.2, star.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Shooting Stars */}
      {shootingStars.map((ss) => (
          <motion.div
            key={`ss-${ss.id}`}
            className="absolute h-[1px] w-[60px] bg-gradient-to-r from-transparent via-blue-400 to-white opacity-0"
            style={{
                top: `${Math.random() * 50}%`,
                left: ss.left,
                transform: "rotate(-45deg)",
            }}
            animate={{
                x: [0, -500],
                y: [0, 500],
                opacity: [0, 1, 0],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: ss.delay,
                repeatDelay: Math.random() * 20 + 10,
                ease: "easeIn",
            }}
          />
      ))}

      {/* Distant nebulae flares */}
      <div className="absolute top-1/4 -left-1/4 w-[80%] h-[80%] bg-blue-900/10 rounded-full blur-[160px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[140px] animate-pulse pointer-events-none" />
    </div>
  );
}
