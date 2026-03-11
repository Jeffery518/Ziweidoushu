"use client";

import React from "react";
import { motion } from "framer-motion";

export function StarField() {
  const stars = Array.from({ length: 120 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.2,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 5,
  }));

  const orbits = [
    { size: 300, duration: 40, delay: 0, color: "rgba(59, 130, 246, 0.08)" },
    { size: 500, duration: 60, delay: -10, color: "rgba(139, 92, 246, 0.05)" },
    { size: 750, duration: 90, delay: -20, color: "rgba(236, 72, 153, 0.03)" },
  ];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
      {/* Base deep space gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-900/10 via-zinc-950 to-black" />

      {/* Central Star (Sun) Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1">
        {/* Core glow */}
        <div className="absolute inset-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-amber-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-orange-500/5 rounded-full blur-[40px] animate-pulse" />
      </div>
      
      {/* Planetary Orbits */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
        {orbits.map((orbit, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-dashed"
            style={{
              width: orbit.size,
              height: orbit.size,
              borderColor: orbit.color,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: orbit.duration,
              repeat: Infinity,
              ease: "linear",
              delay: orbit.delay,
            }}
          >
            {/* A small "planet" or "node" on the orbit */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-400/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            />
          </motion.div>
        ))}
      </div>

      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            boxShadow: star.size > 1 ? "0 0 4px rgba(255,255,255,0.4)" : "none",
          }}
          animate={{
            opacity: [star.opacity, 0.2, star.opacity],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Distant nebulae flares */}
      <div className="absolute top-1/4 -left-1/4 w-[80%] h-[80%] bg-blue-900/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[60%] h-[60%] bg-purple-900/5 rounded-full blur-[140px] pointer-events-none" />
    </div>
  );
}
