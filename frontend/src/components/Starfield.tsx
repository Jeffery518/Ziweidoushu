"use client";

import React from "react";

export function StarField() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020205]">
      {/* 
        Professional Deep Space Background 
        Using layered gradients is the most memory-efficient way to create depth without GPU artifacts.
      */}
      
      {/* 1. Base Deep Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#0a0a14_0%,_#020205_100%)]" />
      
      {/* 2. Soft Nebula Flares - Fixed positions, no animation to save memory */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-950/5 rounded-full blur-[150px]" />

      {/* 3. Static Star Field Pattern - High performance repeated background */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          radial-gradient(1px 1px at 25px 35px, #fff, transparent),
          radial-gradient(1.5px 1.5px at 150px 120px, #fff, transparent),
          radial-gradient(1px 1px at 280px 70px, #fff, transparent),
          radial-gradient(2px 2px at 400px 250px, #fff, transparent),
          radial-gradient(1px 1px at 550px 180px, #fff, transparent),
          radial-gradient(1.2px 1.2px at 700px 320px, #fff, transparent)
        `,
        backgroundSize: '800px 600px',
        backgroundRepeat: 'repeat'
      }} />

      {/* 4. Central Cosmic Center (Solar System vibe) - Elegant and static */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        {/* Subdued Sun Core */}
        <div className="w-12 h-12 bg-amber-500/10 rounded-full blur-2xl" />
        <div className="absolute w-4 h-4 bg-amber-200/20 rounded-full blur-md" />
        
        {/* Subtle Orbit Rings - Very thin for professional look */}
        <div className="absolute w-[320px] h-[320px] rounded-full border border-white/[0.03]" />
        <div className="absolute w-[550px] h-[550px] rounded-full border border-white/[0.02]" />
        <div className="absolute w-[850px] h-[850px] rounded-full border border-white/[0.01]" />
        
        {/* Fixed 'Planets' as accents */}
        <div className="absolute top-[-160px] left-0 w-1.5 h-1.5 rounded-full bg-blue-400/20 shadow-[0_0_8px_rgba(96,165,250,0.2)]" />
        <div className="absolute bottom-[-275px] right-[-100px] w-2 h-2 rounded-full bg-purple-400/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]" />
      </div>

      {/* 5. Vignette for focus */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
