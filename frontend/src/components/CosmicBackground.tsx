"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CosmicBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return <div className="fixed inset-0 bg-slate-950 -z-50" />;

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-950 pointer-events-none">
            {/* 宇宙太阳与银河背景 (Cosmic Sun & Milky Way) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-80 dark:opacity-100 mix-blend-screen overflow-hidden">
                {/* 太阳核心耀斑 (Solar Flare / Core glow) */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(253, 224, 71, 0.8) 0%, rgba(249, 115, 22, 0.5) 35%, rgba(225, 29, 72, 0.2) 65%, rgba(0,0,0,0) 85%)",
                        filter: "blur(40px)"
                    }}
                />

                {/* 银河大螺旋 (Milky Way Spiral) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[150vw] h-[150vw] md:w-[120vw] md:h-[120vw]"
                    style={{
                        background: "conic-gradient(from 0deg at 50% 50%, rgba(0,0,0,0) 0%, rgba(253, 224, 71, 0.15) 15%, rgba(249, 115, 22, 0.2) 30%, rgba(0,0,0,0) 50%, rgba(168, 85, 247, 0.15) 65%, rgba(236, 72, 153, 0.2) 80%, rgba(0,0,0,0) 100%)",
                        filter: "blur(30px)"
                    }}
                />

                {/* 周边浩瀚星尘 (Galactic Stardust) */}
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.05, 1] }}
                    transition={{
                        rotate: { duration: 90, repeat: Infinity, ease: "linear" },
                        scale: { duration: 15, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute -inset-[50%]"
                    style={{
                        backgroundImage: "radial-gradient(1px 1px at 15% 25%, #fde047, transparent), radial-gradient(2px 2px at 45% 75%, #ffffff, transparent), radial-gradient(1.5px 1.5px at 85% 35%, #f9a8d4, transparent), radial-gradient(2.5px 2.5px at 30% 80%, #fb923c, transparent)",
                        backgroundSize: "120px 120px",
                        opacity: 0.6
                    }}
                />
            </div>
        </div>
    );
}
