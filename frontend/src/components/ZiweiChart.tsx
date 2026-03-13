"use client";

import React, { useState, useCallback, useEffect } from "react";
import { PalaceBox, type PalaceData } from "./PalaceBox";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { analyzePalace, analyzeWholeChart } from "@/utils/ziweiAnalysis";
import { TimeController } from "./TimeController";
import { exportChartPDF } from "@/utils/export-pdf";
import { generateShareCard } from "@/utils/share-card";
import { ShareModal } from "@/components/ShareModal";
import { calculateChartStats } from "@/utils/palace-scorer";
import { Download, Share2, Loader2, Info } from "lucide-react";

export interface ChartMeta {
    life_palace: string;
    wuxing_ju: string;
    ziwei_position: string;
    yin_yang_gender?: string;
    shen_gong?: string;
    shen_gong_palace?: string;
    lunar_date_str?: string;
    ziwei_zhi?: string;
}

export interface ZiweiChartData {
    meta: ChartMeta;
    palaces: PalaceData[];
}

const gridMapping: Record<string, string> = {
    "巳": "col-start-1 row-start-1",
    "午": "col-start-2 row-start-1",
    "未": "col-start-3 row-start-1",
    "申": "col-start-4 row-start-1",
    "辰": "col-start-1 row-start-2",
    "酉": "col-start-4 row-start-2",
    "卯": "col-start-1 row-start-3",
    "戌": "col-start-4 row-start-3",
    "寅": "col-start-1 row-start-4",
    "丑": "col-start-2 row-start-4",
    "子": "col-start-3 row-start-4",
    "亥": "col-start-4 row-start-4",
};

const getZodiacOf = (year: number) => {
    const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    return branches[(year - 4 + 12000) % 12];
};

const getStemOf = (year: number) => {
    const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    return stems[(year - 4 + 10000) % 10];
};

export function ZiweiChart({ chartData, isLoading }: { chartData: ZiweiChartData | null; isLoading?: boolean }) {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [shareDataUrl, setShareDataUrl]   = useState<string>("");
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [isSharing, setIsSharing]         = useState(false);
    const [prevChartData, setPrevChartData] = useState<ZiweiChartData | null>(null);

    const [displayOptions, setDisplayOptions] = useState({
        showDaYun: true,
        showLiuNian: true,
        showMinorStars: true,
        showBoshiSpirit: true,
        showSuiqianSpirit: false,
        showXiaoXian: true
    });

    // 仅在年份更新时处理流年渲染逻辑，不要强行切换用户的选中焦点
    useEffect(() => {
        // 如果想要年份切换时重置选中可以放开这里，但用户现在更期望保持静态或手动点击
    }, [selectedYear]);

    // 初始化时避免篡改用户的默认 "null" 视图
    if (chartData && chartData !== prevChartData) {
        setPrevChartData(chartData);
        setSelectedBranch(null);
    }

    const handlePalaceClick = useCallback((branch: string) => {
        setSelectedBranch(branch);
    }, []);

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl aspect-[4/3] sm:aspect-square flex items-center justify-center bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="mt-4 text-zinc-500 tracking-widest text-sm font-medium">排盘演算中...</p>
                </div>
            </div>
        );
    }

    if (!chartData) return null;

    const selectedPalace = selectedBranch ? chartData.palaces.find(p => p.branch === selectedBranch) : null;
    const analysisItems = selectedPalace
        ? analyzePalace({ ...selectedPalace, transformations: selectedPalace.transformations || [] }, chartData)
        : analyzeWholeChart(chartData);

    const pseudoBirthYear = currentYear - 30; // 兜底虚龄计算
    const liuNianBranch = getZodiacOf(selectedYear);
    const liuNianStem = getStemOf(selectedYear);

    const sihuaMap: Record<string, { 禄: string, 权: string, 科: string, 忌: string }> = {
        "甲": { "禄": "廉贞", "权": "破军", "科": "武曲", "忌": "太阳" },
        "乙": { "禄": "天机", "权": "天梁", "科": "紫微", "忌": "太阴" },
        "丙": { "禄": "天同", "权": "天机", "科": "文昌", "忌": "廉贞" },
        "丁": { "禄": "太阴", "权": "天同", "科": "天机", "忌": "巨门" },
        "戊": { "禄": "贪狼", "权": "太阴", "科": "右弼", "忌": "天机" },
        "己": { "禄": "武曲", "权": "贪狼", "科": "天梁", "忌": "文曲" },
        "庚": { "禄": "太阳", "权": "武曲", "科": "太阴", "忌": "天同" },
        "辛": { "禄": "巨门", "权": "太阳", "科": "文曲", "忌": "文昌" },
        "壬": { "禄": "天梁", "权": "紫微", "科": "左辅", "忌": "武曲" },
        "癸": { "禄": "破军", "权": "巨门", "科": "太阴", "忌": "贪狼" }
    };

    const currentSihua = sihuaMap[liuNianStem] || {};

    return (
        <div className="w-full max-w-6xl mx-auto p-2 md:p-6 flex flex-col gap-6 md:gap-8">
            <div className="w-full">
                <TimeController
                    startYear={pseudoBirthYear}
                    currentYear={selectedYear}
                    onYearChange={setSelectedYear}
                />
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 bg-zinc-900/50 p-3 md:p-4 rounded-2xl border border-zinc-800 backdrop-blur-sm w-full lg:w-auto">
                    {[
                        { id: 'showDaYun', label: '大运' },
                        { id: 'showLiuNian', label: '流年' },
                        { id: 'showMinorStars', label: '辅星神煞' },
                        { id: 'showBoshiSpirit', label: '博士十二神' },
                        { id: 'showSuiqianSpirit', label: '岁前十二神' },
                        { id: 'showXiaoXian', label: '小限' },
                    ].map(({ id, label }) => (
                        <label key={id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={displayOptions[id as keyof typeof displayOptions]}
                                onChange={(e) => setDisplayOptions(prev => ({ ...prev, [id]: e.target.checked }))}
                                className="w-4 h-4 rounded-sm border-zinc-700 bg-zinc-800/50 text-indigo-500 shadow-sm focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-[11px] md:text-[13px] text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">
                                {label}
                            </span>
                        </label>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <button
                        onClick={async () => {
                            setIsSharing(true);
                            try {
                                const url = await generateShareCard('ziwei-chart-capture', chartData.meta);
                                setShareDataUrl(url);
                                setShareModalOpen(true);
                            } finally {
                                setIsSharing(false);
                            }
                        }}
                        disabled={isSharing}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-zinc-100 bg-zinc-900 border border-zinc-800 hover:bg-emerald-600 hover:border-emerald-500 disabled:opacity-50"
                    >
                        {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                        {isSharing ? "生成中..." : "分享命盘"}
                    </button>
                    <button
                        onClick={async () => {
                            const stats = calculateChartStats(chartData.palaces);
                            await exportChartPDF('ziwei-chart-capture', {
                                lifepalace: chartData.meta.life_palace,
                                wuxingJu: chartData.meta.wuxing_ju,
                                yinYangGender: chartData.meta.yin_yang_gender ?? '',
                                lunarDateStr: chartData.meta.lunar_date_str,
                                overallScore: stats.overallScore,
                                destinyType: stats.destinyType,
                            });
                        }}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-zinc-100 bg-zinc-900 border border-zinc-800 hover:bg-indigo-600 hover:border-indigo-500"
                    >
                        <Download className="w-4 h-4" />
                        导出命盘
                    </button>
                </div>
            </div>

            <div id="ziwei-chart-capture" className="grid grid-cols-4 grid-rows-4 gap-[1px] p-[1px] pt-8 pb-8 rounded bg-zinc-800 border-zinc-800 shadow-2xl relative">
                {chartData.palaces.map((palace, i) => {
                    const isDaYun = palace.dayun ? (() => {
                        const [s, e] = palace.dayun.split('-').map(Number);
                        const age = selectedYear - pseudoBirthYear + 1;
                        return age >= s && age <= e;
                    })() : false;

                    const isLiuNian = palace.branch === liuNianBranch;
                    const dynamicTrans: string[] = [];
                    const allStars = [...palace.major_stars, ...palace.minor_stars];
                    
                    allStars.forEach(star => {
                        const cleanStarName = star.replace(/[禄权科忌]$/g, "").trim();
                        Object.entries(currentSihua).forEach(([huaType, targetStar]) => {
                            if (cleanStarName === targetStar) {
                                dynamicTrans.push(`${cleanStarName}化${huaType}`);
                            }
                        });
                    });

                    return (
                        <div
                            key={palace.branch}
                            className={cn("w-full h-full relative", gridMapping[palace.branch])}
                        >
                            {(isDaYun && displayOptions.showDaYun) && (
                                <div className="absolute inset-0 border-2 border-dashed border-rose-500/70 rounded-md pointer-events-none z-50" />
                            )}
                            {(isLiuNian && displayOptions.showLiuNian) && (
                                <div className="absolute inset-0 ring-2 ring-emerald-400 rounded-md shadow-[0_0_16px_rgba(52,211,153,0.5)] pointer-events-none z-50" />
                            )}

                            {(isDaYun && displayOptions.showDaYun) && (
                                <div className="absolute -top-3 left-0 right-0 flex justify-center z-[100] pointer-events-none">
                                    <span className="bg-rose-600/90 text-white text-[8px] md:text-[11px] font-black px-2 py-0.5 rounded-full ring-1 ring-rose-400/40">
                                        大运命宫
                                    </span>
                                </div>
                            )}
                            {(isLiuNian && displayOptions.showLiuNian) && (
                                <div className="absolute -bottom-3 left-0 right-0 flex justify-center z-[100] pointer-events-none">
                                    <span className="bg-emerald-500/90 text-white text-[8px] md:text-[11px] font-black px-2 py-0.5 rounded-full ring-1 ring-emerald-300/40 shadow-emerald-500/40">
                                        流年命宫
                                    </span>
                                </div>
                            )}

                            <PalaceBox
                                data={palace}
                                isActive={selectedBranch === palace.branch}
                                onClick={handlePalaceClick}
                                dynamicTrans={dynamicTrans}
                                displayOptions={displayOptions}
                                className="w-full h-full rounded-none"
                            />
                        </div>
                    );
                })}

                <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center p-4 md:p-8 bg-[#121212] relative overflow-hidden">
                    <div className="relative z-10 text-center space-y-4 md:space-y-6 w-full">
                        <h2 className="text-xl md:text-3xl font-bold tracking-[0.2em] text-zinc-100 font-serif">
                            文墨天纪
                        </h2>
                        
                        <div className="flex flex-col gap-2 md:gap-3 text-[10px] md:text-[13px] text-zinc-400 font-serif border-t border-b border-white/10 py-4">
                            <div className="flex justify-between px-4">
                                <span className="text-zinc-500">基本命局</span>
                                <span className="text-zinc-200">{chartData.meta.wuxing_ju}</span>
                            </div>
                            <div className="flex justify-between px-4">
                                <span className="text-zinc-500">命造阴阳</span>
                                <span className="text-zinc-200">{chartData.meta.yin_yang_gender}</span>
                            </div>
                            <div className="flex justify-between px-4">
                                <span className="text-zinc-500">命宫位置</span>
                                <span className="text-zinc-200">{chartData.meta.life_palace}</span>
                            </div>
                            <div className="flex justify-between px-4">
                                <span className="text-zinc-500">身宫位置</span>
                                <span className="text-zinc-300 text-amber-500">{chartData.meta.shen_gong_palace || "命宫"}</span>
                            </div>
                        </div>

                        {chartData.meta.ziwei_zhi && (
                            <div className="pt-2">
                                <span className="text-[10px] md:text-xs text-primary font-black bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                    紫微定制 · {chartData.meta.ziwei_zhi}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full rounded-3xl p-6 md:p-8 bg-[#121212]/80 backdrop-blur-2xl border border-white/5 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-bold text-zinc-100">
                            {selectedPalace ? `${selectedPalace.name}解析` : "全局概览"}
                        </h3>
                        <p className="text-zinc-500 text-sm">
                            {selectedPalace ? `${selectedPalace.stem}${selectedPalace.branch}宫位象数推演` : "基于《天纪》原理的深度批命"}
                        </p>
                    </div>
                    {selectedBranch && (
                        <div className="bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="text-xs font-bold text-zinc-400 tracking-widest">{selectedBranch}宫</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {analysisItems.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "p-6 rounded-2xl border transition-all duration-300",
                                item.level === "destructive" ? "bg-rose-950/20 border-rose-900/50" :
                                    item.level === "warning" ? "bg-amber-950/20 border-amber-900/50" :
                                        item.level === "success" ? "bg-emerald-950/20 border-emerald-900/50" :
                                            "bg-zinc-800/20 border-zinc-700/50"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    item.level === "destructive" ? "bg-rose-500/20 text-rose-400" :
                                        item.level === "warning" ? "bg-amber-500/20 text-amber-400" :
                                            item.level === "success" ? "bg-emerald-500/20 text-emerald-400" :
                                                "bg-zinc-700/50 text-zinc-300"
                                )}>
                                    <Info className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-zinc-100">{item.title}</h4>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed font-serif">
                                {item.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <ShareModal
                isOpen={shareModalOpen}
                dataUrl={shareDataUrl}
                onClose={() => setShareModalOpen(false)}
            />
        </div>
    );
}
