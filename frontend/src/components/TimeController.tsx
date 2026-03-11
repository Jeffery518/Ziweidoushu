"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

interface TimeControllerProps {
    startYear: number;
    currentYear: number;
    onYearChange: (year: number) => void;
    className?: string;
}

export function TimeController({ startYear, currentYear, onYearChange, className }: TimeControllerProps) {
    const [localYear, setLocalYear] = useState(currentYear);
    const [showInfo, setShowInfo] = useState(false);

    // Sync if external prop changes
    useEffect(() => {
        setLocalYear(currentYear);
    }, [currentYear]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setLocalYear(val);
        onYearChange(val);
    };

    const handleIncrement = (amount: number) => {
        const val = localYear + amount;
        setLocalYear(val);
        onYearChange(val);
    };

    const isCurrentYear = localYear === new Date().getFullYear();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "w-full flex flex-col items-start gap-4 md:gap-6 rounded-2xl p-4 md:p-6 backdrop-blur-2xl border shadow-lg",
                "bg-[#121212]/80 border-white/5",
                className
            )}
        >
            <div className="w-full flex flex-col md:flex-row items-center gap-4 md:gap-8">
                {/* Year Readout */}
                <div className="flex flex-col items-center justify-center min-w-[120px]">
                    <span className="text-xs text-zinc-500 font-serif tracking-widest uppercase mb-1">
                        排盘流年
                    </span>
                    <div className="flex items-end gap-1">
                        <span className="text-3xl md:text-4xl font-bold font-serif tabular-nums tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-rose-500">
                            {localYear}
                        </span>
                        <span className="text-sm font-medium text-zinc-400 mb-1">年</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-1 w-full flex flex-col gap-3">
                    <div className="flex justify-between items-center px-1">
                        <button
                            onClick={() => handleIncrement(-10)}
                            className="text-xs text-zinc-400 hover:text-primary transition-colors hover:bg-zinc-800 px-2 py-1 rounded"
                        >
                            -10年 (上大运)
                        </button>
                        {!isCurrentYear && (
                            <button
                                onClick={() => {
                                    const y = new Date().getFullYear();
                                    setLocalYear(y);
                                    onYearChange(y);
                                }}
                                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase py-1 px-3 rounded-full bg-primary/10 border border-primary/20"
                            >
                                回到今年
                            </button>
                        )}
                        <button
                            onClick={() => handleIncrement(10)}
                            className="text-xs text-zinc-400 hover:text-primary transition-colors hover:bg-zinc-800 px-2 py-1 rounded"
                        >
                            +10年 (下大运)
                        </button>
                    </div>

                    <div className="relative flex items-center w-full h-8">
                        <button
                            onClick={() => handleIncrement(-1)}
                            className="absolute left-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors z-10"
                        >
                            -
                        </button>

                        <input
                            type="range"
                            min={startYear}
                            max={startYear + 100}
                            value={localYear}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary px-10"
                        />

                        <button
                            onClick={() => handleIncrement(1)}
                            className="absolute right-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors z-10"
                        >
                            +
                        </button>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400 px-10">
                        <span>{startYear} (出生)</span>
                        <span>{startYear + 100} (百年)</span>
                    </div>
                </div>

            </div>

            {/* Readout toggle button - Now centered as requested */}
            <div className="w-full flex justify-center mt-2 border-t border-white/5 pt-4">
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className={cn(
                        "flex items-center gap-2 text-[12px] px-6 py-2 rounded-full transition-all duration-300 border font-bold shadow-sm",
                        showInfo
                            ? "bg-primary/20 text-primary border-primary/30 shadow-primary/20"
                            : "bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-zinc-100"
                    )}
                >
                    <Info className="w-4 h-4" />
                    <span>大运流年图解</span>
                </button>
            </div>

            {/* 命理知识科普面板 */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="w-full overflow-hidden"
                    >
                        <div className="mt-2 p-4 md:p-5 bg-[#181818] rounded-xl border border-zinc-800/60 text-[13px] md:text-[14px] leading-relaxed text-zinc-400 space-y-4 font-serif">
                            <p>
                                <strong className="text-zinc-200">1. 本命盘（底层基底）：</strong>
                                先天格局与天赋底座，静态盘面，决定了一生宏观的财富、事业、性格基调与天花板。
                            </p>
                            <p>
                                <strong className="text-zinc-200">2. 大运（十年一变）：</strong>
                                每十年变换一次重心（图中带有<span className="text-rose-500 font-sans mx-1">红色虚线框</span>标识）。大运好比人生的“气候”或“副本环境”，决定了这十年内的综合运势起伏和主要人生课题。
                            </p>
                            <p>
                                <strong className="text-zinc-200">3. 流年（一年一变）：</strong>
                                当前滑动年份的具体落脚点（图中带有<span className="text-emerald-500 font-sans mx-1">绿色发光框</span>标识）。系统会自动结算此年的临时引动（新增流年四化飞星，带闪烁），精确推演具体在哪一年触发大运潜伏的吉凶事件。
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
