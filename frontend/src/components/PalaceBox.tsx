import React from "react";
import { cn } from "@/lib/utils";

export interface PalaceData {
    branch: string;
    stem: string;
    name: string;
    major_stars: string[];
    minor_stars: string[];
    transformations: string[];
    // Extended fields for professional layout
    star_brightness?: Record<string, string>;
    age_range?: string;
    boshi_spirit?: string;
    suiqian_spirit?: string;
    xiao_xian?: string;
    flow_years?: string;
    small_limits?: string;
    shen_sha?: string[];
    // Newly added for Time-Series logic
    dayun?: string;
    palace_score?: number;
}

interface PalaceBoxProps {
    data: PalaceData;
    isActive?: boolean;
    className?: string;
    onClick?: (branch: string) => void;
    dynamicTrans?: string[]; // Transient Sihua for LiuNian/DaYun
    displayOptions?: {
        showDaYun: boolean;
        showLiuNian: boolean;
        showMinorStars: boolean;
        showBoshiSpirit: boolean;
        showSuiqianSpirit: boolean;
        showXiaoXian: boolean;
    };
}

const getStarColor = (star: string) => {
    const redStars = ["廉贞", "太阳", "火星", "铃星", "禄存", "红鸾", "天喜", "武曲"];
    const purpleStars = ["紫微", "天府", "太阴", "巨门", "文曲", "文昌", "左辅", "右弼"];
    const greenStars = ["天机", "贪狼", "擎羊", "陀罗", "天同", "七杀", "破军"];

    if (redStars.some(s => star.includes(s))) return "text-red-400";
    if (purpleStars.some(s => star.includes(s))) return "text-purple-400";
    if (greenStars.some(s => star.includes(s))) return "text-emerald-500";
    return "text-zinc-300";
};

const getTransformationColor = (type: string) => {
    switch (type) {
        case "禄": return "bg-emerald-500 text-white border border-emerald-600";
        case "权": return "bg-amber-500 text-white border border-amber-600";
        case "科": return "bg-blue-500 text-white border border-blue-600";
        case "忌": return "bg-rose-500 text-white border border-rose-600";
        default: return "bg-zinc-500 text-white border border-zinc-600";
    }
};

export const PalaceBox = React.memo(function PalaceBox({ data, isActive, className, onClick, dynamicTrans, displayOptions }: PalaceBoxProps) {
    // Extract transformation if naturally embedded in the list, or via the `transformations` or `dynamicTrans` array
    const getTransForStar = (star: string) => {
        // Check dynamic first (highest priority for LiuNian)
        if (dynamicTrans) {
            const dt = dynamicTrans.find(t => t.includes(star) || star.includes(t.slice(0, 2)));
            if (dt) return { label: dt.slice(-1), isDynamic: true };
        }

        // Then static
        const trans = data.transformations.find(t => t.includes(star) || star.includes(t.slice(0, 2)));
        if (trans) return { label: trans.slice(-1), isDynamic: false };

        return null;
    };

    const allStars = [...data.major_stars, ...(displayOptions?.showMinorStars !== false ? data.minor_stars : [])];

    return (
        <div
            onClick={() => onClick?.(data.branch)}
            className={cn(
                "relative flex flex-col p-1.5 md:p-2 aspect-square transition-all duration-200 cursor-pointer overflow-hidden",
                "bg-[#121212] hover:bg-[#181818]",
                isActive ? "ring-2 ring-primary border-primary shadow-sm" : "border border-zinc-800",
                className
            )}
        >
            {/* Score Badge (Quantified Palace Power) */}
            {data.palace_score !== undefined && (
                <div className={cn(
                    "absolute top-0 left-0 px-1.5 py-0.5 rounded-br-lg text-[9px] md:text-[10px] font-bold z-30 shadow-sm border-r border-b",
                    data.palace_score >= 10 ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" :
                    data.palace_score >= 0  ? "bg-zinc-800/50 text-zinc-400 border-zinc-700/50" :
                                              "bg-rose-600/20 text-rose-400 border-rose-500/30"
                )}>
                    {data.palace_score > 0 ? `+${data.palace_score}` : data.palace_score}
                </div>
            )}
            {/* Top: Stars (Right to Left layout natively using flex-row-reverse) */}
            <div className="flex flex-row-reverse flex-wrap gap-x-1 md:gap-x-[5px] gap-y-1 items-start w-full h-auto overflow-hidden">
                {allStars.map((star, idx) => {
                    const cleanStarName = star.replace(/[禄权科忌]$/g, ""); // Clean if backend mixes them
                    const trans = getTransForStar(cleanStarName);
                    const brightness = data.star_brightness?.[cleanStarName] || "";
                    const color = getStarColor(cleanStarName);

                    return (
                        <div key={idx} className="flex flex-col items-center gap-[2px]">
                            <span className={cn("text-[13px] md:text-[15px] font-bold font-serif leading-none", color)}>{cleanStarName[0]}</span>
                            <span className={cn("text-[13px] md:text-[15px] font-bold font-serif leading-none", color)}>{cleanStarName[1] || " "}</span>

                            {(trans || brightness || cleanStarName.length > 2) && (
                                <div className="flex flex-col items-center gap-[2px] mt-0.5">
                                    {trans && (
                                        <span className={cn(
                                            "text-[8px] md:text-[9px] w-[12px] h-[12px] md:w-[14px] md:h-[14px] flex items-center justify-center rounded-sm font-sans shadow-sm leading-none",
                                            getTransformationColor(trans.label),
                                            trans.isDynamic && "animate-pulse ring-1 ring-white shadow-[0_0_8px_currentColor]"
                                        )}>
                                            {trans.label}
                                        </span>
                                    )}
                                    {(displayOptions?.showBoshiSpirit !== false && brightness) && (
                                        <span className="text-[8px] md:text-[10px] bg-zinc-800 text-zinc-400 font-bold px-0.5 rounded shadow-sm leading-none whitespace-nowrap mt-[1px]">
                                            {brightness}
                                        </span>
                                    )}
                                    {(!brightness && cleanStarName.length > 2) && (
                                        <span className="text-[9px] md:text-[10px] text-zinc-500 font-medium font-serif leading-none whitespace-nowrap">
                                            {cleanStarName.slice(2)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Middle: DaYun limits and xian */}
            <div className="flex-1 flex flex-col justify-center items-center w-full min-h-0 relative z-0 mt-2 mb-2">
                <div className="flex gap-2 text-[8px] md:text-[9px] text-zinc-500 whitespace-nowrap opacity-80 scale-90 md:scale-100">
                    {displayOptions?.showLiuNian !== false && data.flow_years && <span>流年: {data.flow_years}</span>}
                    {displayOptions?.showLiuNian !== false && data.small_limits && <span>小限: {data.small_limits}</span>}
                    {displayOptions?.showXiaoXian !== false && data.xiao_xian && (
                        <span className="text-amber-400 font-bold">{data.xiao_xian}</span>
                    )}
                </div>
                {displayOptions?.showDaYun !== false && data.age_range && (
                    <div className="text-[10px] md:text-[13px] font-semibold text-zinc-300 mt-0.5 tracking-wider">
                        {data.age_range}
                    </div>
                )}
            </div>

            {/* Bottom: ShenSha/DaYun, Names, Stem, Branch */}
            <div className="w-full mt-auto flex justify-between items-end relative z-10 pt-1 border-t border-zinc-800/60">
                {/* Bottom Left: ShenSha & DaYun + Spirits */}
                <div className="flex flex-col items-start leading-none gap-[3px]">
                    {displayOptions?.showMinorStars !== false && data.shen_sha && data.shen_sha.map((ss, idx) => (
                        <span key={idx} className="text-[8px] md:text-[10px] text-emerald-500/80 font-serif">{ss}</span>
                    ))}
                    {displayOptions?.showDaYun !== false && data.dayun && (
                        <span className="text-[9px] md:text-[11px] font-bold text-rose-400 font-sans tracking-tighter bg-rose-950/30 px-1 py-0.5 rounded-sm border border-rose-900/50">
                            {data.dayun}
                        </span>
                    )}
                    {displayOptions?.showSuiqianSpirit !== false && data.suiqian_spirit && (
                        <span className="text-[8px] md:text-[10px] font-bold text-sky-400 font-serif">
                            {data.suiqian_spirit}
                        </span>
                    )}
                </div>

                {/* Bottom Right: States, Name, Stem/Branch */}
                <div className="flex flex-col items-end leading-none gap-[2px]">
                    <div className="flex gap-1 items-end mb-0.5">
                        {displayOptions?.showBoshiSpirit !== false && data.boshi_spirit && (
                            <span className="text-[9px] md:text-[11px] font-bold text-indigo-400/80 font-serif mr-1">
                                {data.boshi_spirit}
                            </span>
                        )}
                        <span className={cn(
                            "px-1 py-[1.5px] rounded-sm text-[9px] md:text-[11px] font-bold font-serif whitespace-nowrap box-border shadow-sm",
                            data.name === "命宫" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300"
                        )}>
                            {data.name}
                        </span>
                    </div>
                    <span className="text-[11px] md:text-[14px] font-bold font-serif text-zinc-200 mt-0.5 tracking-widest">
                        {data.stem}{data.branch}
                    </span>
                </div>
            </div>
        </div>
    );
});
