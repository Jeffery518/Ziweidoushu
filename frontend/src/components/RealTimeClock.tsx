"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export function RealTimeClock({ className }: { className?: string }) {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTime(new Date());
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) {
        return (
            <div className={cn("flex items-center gap-2 text-zinc-500 font-serif h-5", className)}>
                <div className="w-4 h-4 rounded-full border-2 border-zinc-200 border-t-zinc-400 animate-spin" />
                <span className="text-xs">加载时间中...</span>
            </div>
        );
    }

    const formatTime = (date: Date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        const day = days[date.getDay()];
        return `${y}年${m}月${d}日 星期${day}`;
    };

    return (
        <div className={cn("flex flex-col gap-1 items-end", className)}>
            <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-[15px] font-bold tracking-widest font-mono">
                    {formatTime(time)}
                </span>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-serif tracking-wider">
                {formatDate(time)}
            </span>
        </div>
    );
}
