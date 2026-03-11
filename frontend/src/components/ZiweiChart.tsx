"use client";

import React, { useState, useCallback } from "react";
import { PalaceBox, type PalaceData } from "./PalaceBox";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { analyzePalace, analyzeWholeChart } from "@/utils/ziweiAnalysis";
import { TimeController } from "./TimeController";
import { exportChartPDF } from "@/utils/export-pdf";
import { generateShareCard } from "@/utils/share-card";
import { ShareModal } from "@/components/ShareModal";
import { calculateChartStats } from "@/utils/palace-scorer";
import { Download, Share2, Loader2 } from "lucide-react";

export interface ChartMeta {
    life_palace: string;
    wuxing_ju: string;
    ziwei_position: string;
    yin_yang_gender?: string;
    shen_gong?: string;
    shen_gong_palace?: string;
    lunar_date_str?: string;
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

export function ZiweiChart({ chartData, isLoading }: { chartData: ZiweiChartData | null; isLoading?: boolean }) {
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [shareDataUrl, setShareDataUrl]   = useState<string>("");
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [isSharing, setIsSharing]         = useState(false);
    const [prevChartData, setPrevChartData] = useState<ZiweiChartData | null>(null);

    // Time-series state
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);

    // Filter toggles state
    const [displayOptions, setDisplayOptions] = useState({
        showDaYun: true,
        showLiuNian: true,
        showMinorStars: true,
        showBoshiSpirit: true,
        showSuiqianSpirit: false,
        showXiaoXian: true
    });

    // React 推荐：通过在渲染中直接对比 props 变化来派生状态，避免 useEffect 带来的多余重绘和 ESLint 报错
    if (chartData !== prevChartData) {
        setPrevChartData(chartData);
        // 新增需求：全局批命功能默认在未点击任何宫位时展示。
        // 因此，每次新生成命盘时，将其重置为 null，不再默认选中命宫。
        setSelectedBranch(null);
        setSelectedYear(currentYear); // Reset to current year
    }

    const handlePalaceClick = useCallback((branch: string) => {
        setSelectedBranch(branch);
    }, []);

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl aspect-[4/3] sm:aspect-square flex items-center justify-center relative bg-zinc-950 rounded-lg border border-zinc-800 shadow-sm">
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

    // Helper: Compute LiuNian and DaYun for the selected year
    const startAgeStr = chartData.meta.wuxing_ju.match(/\d+/)?.[0] || '2';
    // const startAge = parseInt(startAgeStr);

    // We assume birth year is simply (Current Year - current age) for demonstration if not provided.
    // In a real pro app, we'd need to exact birth year from backend meta, but for now we calculate a pseudo birth year.
    // Let's assume standard logic without exact birth mapping requires a "base birth year". We can let user pick.
    const pseudoBirthYear = currentYear - 30; // Fallback, normally passed from engine

    // Helpers for LiuNian branch and stem
    // Zhaodong/Ziwei calculation for LiuNian Branch
    const getZodiacOf = (year: number) => {
        const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        return branches[(year - 4 + 12000) % 12];
    };

    // Calculation for LiuNian Stem
    const getStemOf = (year: number) => {
        const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
        return stems[(year - 4 + 10000) % 10];
    };

    const liuNianBranch = getZodiacOf(selectedYear);
    const liuNianStem = getStemOf(selectedYear);

    // 四化表 (SiHua Map based on Stem)
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

            {/* Time Controller & Display Settings */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full">
                <TimeController
                    startYear={pseudoBirthYear} // we will want to read real birth year eventually
                    currentYear={selectedYear}
                    onYearChange={setSelectedYear}
                />
                
                <div className="flex flex-wrap items-center bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-sm gap-2">
                    <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary rounded cursor-pointer" checked={displayOptions.showDaYun} onChange={(e) => setDisplayOptions(prev => ({...prev, showDaYun: e.target.checked}))} />
                        <span className="text-zinc-300 text-xs font-bold font-serif select-none">大运</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary rounded cursor-pointer" checked={displayOptions.showLiuNian} onChange={(e) => setDisplayOptions(prev => ({...prev, showLiuNian: e.target.checked}))} />
                        <span className="text-zinc-300 text-xs font-bold font-serif select-none">流年</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary rounded cursor-pointer" checked={displayOptions.showMinorStars} onChange={(e) => setDisplayOptions(prev => ({...prev, showMinorStars: e.target.checked}))} />
                        <span className="text-zinc-300 text-xs font-bold font-serif select-none">辅星神煞</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary rounded cursor-pointer" checked={displayOptions.showBoshiSpirit} onChange={(e) => setDisplayOptions(prev => ({...prev, showBoshiSpirit: e.target.checked}))} />
                        <span className="text-zinc-300 text-xs font-bold font-serif select-none">博士十二神</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary rounded cursor-pointer" checked={displayOptions.showSuiqianSpirit} onChange={(e) => setDisplayOptions(prev => ({...prev, showSuiqianSpirit: e.target.checked}))} />
                        <span className="text-zinc-300 text-xs font-bold font-serif select-none">岁前十二神</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary rounded cursor-pointer" checked={displayOptions.showXiaoXian} onChange={(e) => setDisplayOptions(prev => ({...prev, showXiaoXian: e.target.checked}))} />
                        <span className="text-zinc-300 text-xs font-bold font-serif select-none">小限</span>
                    </label>
                </div>
                {/* 分享按钮 */}
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
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-emerald-600 hover:text-white border border-zinc-700 hover:border-emerald-500 transition-all duration-200 shadow whitespace-nowrap flex-shrink-0 disabled:opacity-60"
                >
                    {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                    {isSharing ? "生成中..." : "分享命盘"}
                </button>
                {/* 导出 PDF 按钮 */}
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
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-purple-600 hover:text-white border border-zinc-700 hover:border-purple-500 transition-all duration-200 shadow whitespace-nowrap flex-shrink-0"
                >
                    <Download className="w-3.5 h-3.5" />
                    导出命盘
                </button>
            </div>

            <div id="ziwei-chart-capture" className="grid grid-cols-4 grid-rows-4 gap-[1px] p-[1px] rounded flex-shrink-0 bg-zinc-800 border border-zinc-800 overflow-hidden shadow-2xl">

                {chartData.palaces.map((palace, i) => {
                    const isDaYun = palace.dayun ? (
                        /* Simple check: Does selectedYear mapped age fall into "X-Y"? */
                        (() => {
                            const [s, e] = palace.dayun.split('-').map(Number);
                            const age = selectedYear - pseudoBirthYear + 1; // 虚岁
                            return age >= s && age <= e;
                        })()
                    ) : false;

                    const isLiuNian = palace.branch === liuNianBranch;

                    // Build Dynamic Transformations
                    const dynamicTrans: string[] = [];
                    const allStars = [...palace.major_stars, ...palace.minor_stars];
                    allStars.forEach(star => {
                        const cleanStarName = star.replace(/[禄权科忌]$/g, "");
                        Object.entries(currentSihua).forEach(([huaType, targetStar]) => {
                            if (cleanStarName === targetStar) {
                                dynamicTrans.push(`${cleanStarName}化${huaType}`);
                            }
                        });
                    });

                    return (
                        <motion.div
                            key={palace.branch}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03, duration: 0.3 }}
                            className={cn("w-full h-full relative", gridMapping[palace.branch])}
                        >
                            {/* Dynamic Highlights for Time-Series */}
                            {(isDaYun && displayOptions.showDaYun) && (
                                <div className="absolute inset-0 border-2 border-dashed border-rose-500/50 rounded pointer-events-none z-20">
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">大运命宫</span>
                                </div>
                            )}
                            {(isLiuNian && displayOptions.showLiuNian) && (
                                <div className="absolute inset-0 border-2 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded pointer-events-none z-20">
                                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">流年命宫</span>
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
                        </motion.div>
                    );
                })}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center p-4 md:p-8 bg-[#121212] relative overflow-hidden"
                >
                    <div className="relative z-10 text-center space-y-4 md:space-y-6 w-full">
                        <h2 className="text-xl md:text-3xl font-bold tracking-[0.2em] text-zinc-100 font-serif">
                            文墨天纪
                        </h2>

                        <div className="flex flex-col gap-2 mx-auto w-3/4 max-w-xs text-sm md:text-[15px] font-serif">
                            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-1">
                                <span className="text-zinc-500">基本命局</span>
                                <span className="text-zinc-200 font-bold">{chartData.meta.wuxing_ju}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-1">
                                <span className="text-zinc-500">命造阴阳</span>
                                <span className="text-zinc-200 font-bold">{chartData.meta.yin_yang_gender || "未知"}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-1">
                                <span className="text-zinc-500">命宫位置</span>
                                <span className="text-zinc-200 font-bold">{chartData.meta.life_palace}</span>
                            </div>
                            {chartData.meta.shen_gong && (
                                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-1">
                                    <span className="text-zinc-500">身宫位置</span>
                                    <span className="text-amber-400 font-bold">{chartData.meta.shen_gong} ({chartData.meta.shen_gong_palace})</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-1">
                                <span className="text-zinc-500">紫微定局</span>
                                <span className="text-primary font-bold">{chartData.meta.ziwei_position}宫</span>
                            </div>
                        </div>
                    </div>

                    <p className="absolute bottom-4 text-[10px] md:text-xs text-zinc-400 italic tracking-wider font-serif">
                        点击外围宫位查看象数解析
                    </p>
                </motion.div>
            </div>

            {/* 高端解析面板 (Analysis Panel) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                    "w-full rounded-3xl p-6 md:p-8 backdrop-blur-2xl border shadow-2xl",
                    "bg-[#121212]/80 border-white/5 flex flex-col gap-6",
                    "shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
                )}
            >
                {/* 头部标题区 */}
                <div className="border-b border-zinc-200 dark:border-white/10 pb-5">
                    <h3 className="text-xl md:text-2xl font-bold tracking-wider text-zinc-100 flex items-center gap-3">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
                            {selectedPalace ? `${selectedPalace.name}解析` : "全局概览"}
                        </span>
                        {selectedPalace && (
                            <span className="text-xs font-medium tracking-widest text-zinc-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                                {selectedPalace.stem}{selectedPalace.branch}宫
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-2 font-serif tracking-wide">
                        {selectedPalace
                            ? "基于《天纪》原理为您生成本宫位专属洞察论断"
                            : "基于倪海厦《天纪》十四步绝密断命法，为您推演全局总批"}
                    </p>
                </div>

                {/* 解析内容卡片区 */}
                {analysisItems.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {analysisItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08, duration: 0.4 }}
                                className={cn(
                                    "p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group",
                                    item.level === "destructive" ? "bg-rose-950/20 border-rose-900/50" :
                                        item.level === "warning" ? "bg-amber-950/20 border-amber-900/50" :
                                            item.level === "success" ? "bg-emerald-950/20 border-emerald-900/50" :
                                                "bg-zinc-900/40 border-zinc-800"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-lg font-bold text-zinc-100 tracking-wide font-serif">
                                        {item.title}
                                    </h4>
                                    <span className={cn(
                                        "px-2.5 py-1 text-[10px] md:text-xs font-bold rounded-md font-sans tracking-wider uppercase transition-colors",
                                        item.type === "transformation" ? "bg-purple-900/40 text-purple-300" :
                                            item.type === "pattern" ? "bg-blue-900/40 text-blue-300" :
                                                item.type === "warning" ? "bg-rose-900/40 text-rose-300" :
                                                    "bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700"
                                    )}>
                                        {item.type === "star" ? "星曜" : item.type === "pattern" ? "格局" : item.type === "transformation" ? "四化" : "提示"}
                                    </span>
                                </div>
                                <p className="text-[14px] md:text-[15px] leading-7 text-zinc-400 font-serif whitespace-pre-line text-justify">
                                    {item.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* 分享卡片模态框 */}
            <ShareModal
                isOpen={shareModalOpen}
                dataUrl={shareDataUrl}
                onClose={() => setShareModalOpen(false)}
            />
        </div>
    );
}
