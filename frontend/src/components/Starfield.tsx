"use client";

import React from "react";
import { motion } from "framer-motion";

export function StarField() {
  // Create three layers of stars for a sense of depth and rotation
  const layers = [
    { count: 150, speed: 120, size: 1, opacity: 0.6 },
    { count: 100, speed: 180, size: 1.5, opacity: 0.4 },
    { count: 50, speed: 240, size: 2.5, opacity: 0.3 },
  ];

  const orbits = [
    { size: 280, duration: 25, color: "rgba(59, 130, 246, 0.15)", planetColor: "#60a5fa" },
    { size: 450, duration: 45, color: "rgba(139, 92, 246, 0.1)", planetColor: "#a855f7" },
    { size: 650, duration: 75, color: "rgba(236, 72, 153, 0.08)", planetColor: "#ec4899" },
    { size: 900, duration: 110, color: "rgba(20, 184, 166, 0.05)", planetColor: "#14b8a6" },
  ];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020203]">
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black" />

      {/* Galaxy Rotation Layers */}
      {layers.map((layer, index) => (
        <motion.div
          key={`layer-${index}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw]"
          animate={{ rotate: 360 }}
          transition={{
            duration: layer.speed,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {Array.from({ length: layer.count }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white shadow-[0_0_8px_white]"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: layer.size,
                height: layer.size,
                opacity: layer.opacity,
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Central Solar System Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
        
        {/* The Sun - Central Energy Source */}
        <div className="relative">
          <div className="absolute inset-0 w-8 md:w-12 h-8 md:h-12 -translate-x-1/2 -translate-y-1/2 bg-amber-400 rounded-full shadow-[0_0_60px_#f59e0b] z-30" />
          <div className="absolute inset-0 w-24 md:w-32 h-24 md:h-32 -translate-x-1/2 -translate-y-1/2 bg-amber-500/20 rounded-full blur-2xl animate-pulse z-20" />
          <div className="absolute inset-0 w-48 md:w-64 h-48 md:h-64 -translate-x-1/2 -translate-y-1/2 bg-orange-600/10 rounded-full blur-[80px] z-10" />
        </div>

        {/* Orbits and Revolving Planets */}
        {orbits.map((orbit, i) => (
          <motion.div
            key={`orbit-${i}`}
            className="absolute rounded-full border border-zinc-100/10"
            style={{
              width: orbit.size,
              height: orbit.size,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: orbit.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* The Orbit Path Visual */}
            <div className="absolute inset-0 rounded-full border border-dashed" style={{ borderColor: orbit.color }} />
            
            {/* The Planet */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow-[0_0_15px_currentColor]"
              style={{ 
                backgroundColor: orbit.planetColor,
                color: orbit.planetColor
              }}
            >
              {/* Subtle planet glow */}
              <div className="absolute inset-0 w-full h-full rounded-full bg-inherit blur-sm animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Distant Galactic Nebula Dust */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(30,58,138,0.05)_50%,_transparent_100%)] pointer-events-none" />
    </div>
  );
}
