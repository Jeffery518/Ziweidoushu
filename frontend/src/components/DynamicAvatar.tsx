"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DynamicAvatarProps {
    src?: string;
    alt?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function DynamicAvatar({
    src = "/nishi-avatar.jpg",
    alt = "天纪导师",
    className,
    size = "md"
}: DynamicAvatarProps) {
    const [imgError, setImgError] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Avatar size map
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-11 h-11",
        lg: "w-16 h-16"
    };

    // Outer ring size map (slightly larger than avatar)
    const ringSizes = {
        sm: "w-[2.6rem] h-[2.6rem]",
        md: "w-[3.5rem] h-[3.5rem]",
        lg: "w-[4.8rem] h-[4.8rem]"
    };

    if (!mounted) return <div className={cn("rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse", ringSizes[size], className)} />;

    return (
        <div className={cn("relative flex items-center justify-center group flex-shrink-0", ringSizes[size], className)}>
            {/* Outer Rotating Astrolabe / Starfield Ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-primary/40 dark:border-primary/30 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            >
                {/* Glowing stars on the ring */}
                <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_2px_rgba(var(--primary),0.6)] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-blue-500/80 rounded-full shadow-[0_0_5px_1px_rgba(59,130,246,0.5)]" />
                <div className="absolute top-1/3 -left-0.5 w-1 h-1 bg-purple-500/80 rounded-full shadow-[0_0_5px_1px_rgba(168,85,247,0.5)]" />
            </motion.div>

            {/* Secondary slow reverse rotating ring */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-1 rounded-full border border-zinc-200/80 dark:border-zinc-800/60 opacity-60"
            />

            {/* Avatar Container with Floating Effect */}
            <motion.div
                animate={{ y: [-1.5, 1.5, -1.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={cn(
                    "relative rounded-full overflow-hidden border-[1.5px] border-white dark:border-zinc-900 shadow-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center z-10",
                    sizeClasses[size]
                )}
            >
                {/* Inner Glow / Vignette */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent mix-blend-overlay z-10 pointer-events-none" />

                {!imgError ? (
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover scale-[1.05] filter brightness-[1.02] contrast-[1.05] transition-transform duration-700 group-hover:scale-[1.1]"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <User className="w-1/2 h-1/2 text-zinc-400 dark:text-zinc-500" />
                )}
            </motion.div>
        </div>
    );
}
