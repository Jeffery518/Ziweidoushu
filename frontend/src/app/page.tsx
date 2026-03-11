"use client";

import { useState } from "react";
import { ZiweiChart } from "@/components/ZiweiChart";
import { ChartInsightPanel } from "@/components/ChartInsightPanel";
import { Loader2, Settings2, X, Sparkles, Clock, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { DynamicAvatar } from "@/components/DynamicAvatar";
import { RealTimeClock } from "@/components/RealTimeClock";
import { useZiweiChart } from "@/hooks/use-ziwei-chart";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { NiHaishaIntro } from "@/components/NiHaishaIntro";
import { StarField } from "@/components/Starfield";
import { cn } from "@/lib/utils";

export default function Home() {
  const { chartData, isLoading, error, ragContext, formData, setFormData, handleGenerate } = useZiweiChart();

  // 解决用户“设置功能隐藏后调不出”的核心状态
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  return (
    <div className="relative w-full flex justify-center py-6 md:py-10 px-4 md:px-8 bg-black min-h-screen text-zinc-100 overflow-hidden">
      {/* Dynamic Starry Background */}
      <StarField />

      <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-6 md:gap-8 relative z-10 transition-all duration-500">

        {/* 左侧控制面板与输入区 */}
        <aside
          className={cn(
            "flex-shrink-0 flex flex-col space-y-6 transition-all duration-500 origin-left overflow-y-auto hidden-scrollbar",
            isPanelVisible ? "w-full lg:w-[380px] xl:w-[420px] opacity-100 scale-100" : "w-0 opacity-0 scale-95 overflow-hidden h-0 lg:h-auto"
          )}
        >
          <div className="p-6 md:p-8 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-xl shadow-black/5 relative overflow-hidden group">

            {/* 装饰性背景光晕 */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-5 mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <DynamicAvatar size="md" src="/nishi-avatar.jpg" className="shadow-[0_0_15px_rgba(var(--primary),0.1)] rounded-full" />
                <div>
                  <h1 className="text-xl font-bold tracking-wider font-serif bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                    天纪·紫微起盘
                  </h1>
                  <p className="text-[11px] text-zinc-500 mt-0.5 tracking-wider uppercase">
                    Destiny Matrix Engine
                  </p>
                </div>
              </div>
              <RealTimeClock className="hidden sm:flex" />

              {/* 移动端/窄屏关闭按钮 (解决设置被隐藏无法调出点的一个退路) */}
              <button
                onClick={() => setIsPanelVisible(false)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors lg:hidden"
                aria-label="隐藏控制面板"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">公历年份</label>
                  <input type="number" min="1900" max="2100" value={formData.solar_year} onChange={e => setFormData({ ...formData, solar_year: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 outline-none text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-zinc-100" />
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">公历月份</label>
                  <input type="number" min="1" max="12" value={formData.solar_month} onChange={e => setFormData({ ...formData, solar_month: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 outline-none text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-zinc-100" />
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">日期</label>
                  <input type="number" min="1" max="31" value={formData.solar_day} onChange={e => setFormData({ ...formData, solar_day: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 outline-none text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-zinc-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">生辰时支</label>
                  <div className="relative">
                    <select
                      value={formData.hour_branch}
                      onChange={e => setFormData({ ...formData, hour_branch: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 outline-none text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none font-medium text-zinc-100"
                    >
                      {['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].map(v => <option key={v} value={v}>{v}时</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-xs">▼</div>
                  </div>
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">命造性别</label>
                  <div className="relative">
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 outline-none text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all appearance-none font-medium text-zinc-100"
                    >
                      <option value="男">乾造 (男)</option>
                      <option value="女">坤造 (女)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-xs">▼</div>
                  </div>
                </div>
              </div>

              {/* 十二时辰现代时间对照表 */}
              <div className="pt-2">
                  <div className="bg-zinc-900/40 rounded-2xl p-4 border border-zinc-800 shadow-sm relative overflow-hidden group/table">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/table:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <h4 className="text-[12px] font-bold text-zinc-100 flex items-center gap-1.5 font-serif tracking-widest pl-1">
                      <Clock className="w-3.5 h-3.5 text-primary/70" />
                      十二时辰速查
                    </h4>
                  </div>

                  <div className="grid grid-cols-4 gap-2 relative z-10">
                    {[
                      { b: '子', t: '23:00-01:00' }, { b: '丑', t: '01:00-03:00' }, { b: '寅', t: '03:00-05:00' }, { b: '卯', t: '05:00-07:00' },
                      { b: '辰', t: '07:00-09:00' }, { b: '巳', t: '09:00-11:00' }, { b: '午', t: '11:00-13:00' }, { b: '未', t: '13:00-15:00' },
                      { b: '申', t: '15:00-17:00' }, { b: '酉', t: '17:00-19:00' }, { b: '戌', t: '19:00-21:00' }, { b: '亥', t: '21:00-23:00' }
                    ].map(item => (
                      <div key={item.b} className="flex flex-col items-center justify-center bg-black/40 border border-zinc-800/80 rounded-xl py-1.5 px-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-primary/40 hover:bg-primary/5 hover:shadow-md transition-all duration-300 cursor-default group/item transform hover:-translate-y-0.5">
                        <span className="text-[12px] font-bold text-zinc-300 font-serif group-hover/item:text-primary transition-colors">{item.b}</span>
                        <span className="text-[10px] text-zinc-400 font-mono tracking-tighter mt-0.5">{item.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full relative mt-6 inline-flex items-center justify-center overflow-hidden text-sm font-medium rounded-xl group bg-blue-600 text-white hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-900/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-70"
              >
                <span className="relative w-full px-5 py-3.5 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="tracking-widest font-bold text-[13px]">星轨推演中...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[13px] tracking-[0.2em] font-bold">推演命盘</span>
                    </>
                  )}
                </span>
              </button>

              {error && (
                <div className="p-3 mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[13px] text-center font-medium animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 倪海厦老师介绍 */}
          <NiHaishaIntro className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100" />

          {/* 大师解盘 — 结构化 AI 洞见卡片 */}
          {chartData && (
            <div className="w-full bg-zinc-950/95 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 shadow-xl shadow-black/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
              <div className="flex flex-col gap-4 items-start relative z-10 w-full">
                <div className="flex items-center gap-3 w-full border-b border-zinc-800 pb-4">
                  <DynamicAvatar size="sm" src="/nishi-avatar.jpg" />
                  <div>
                    <h2 className="text-sm font-bold tracking-widest text-zinc-100 font-serif">天纪原著批断</h2>
                    <p className="text-[10px] text-zinc-200 mt-0.5">{chartData.meta.yin_yang_gender} · {chartData.meta.wuxing_ju}</p>
                  </div>
                </div>

                <p className="text-[12px] leading-relaxed text-zinc-200 font-serif">
                  命主为 <strong className="text-white">{chartData.meta.yin_yang_gender}</strong>，命宫落于
                  <strong className="text-white"> {chartData.meta.life_palace}</strong> 宫，统御
                  <strong className="text-white"> {chartData.meta.wuxing_ju}</strong> 命造。
                </p>

                {ragContext.length > 0 ? (
                  <div className="space-y-3 w-full">
                    {ragContext.map((item, idx) => (
                      <div key={idx} className="rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 overflow-hidden">
                        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800/80">
                          <h4 className="text-zinc-100 font-bold text-[12px] font-serif">{item.star} 坐命</h4>
                        </div>
                        {/* Structured 3-section cards */}
                        <div className="divide-y divide-zinc-800">
                          <div className="flex items-start gap-2 px-4 py-2.5">
                            <TrendingUp className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] leading-relaxed text-zinc-200 font-serif">{item.quote}</p>
                          </div>
                          <div className="flex items-start gap-2 px-4 py-2.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] leading-relaxed text-zinc-200 font-serif">注意宫位四化的影响，尤其是化忌落入时须谨慎应对。</p>
                          </div>
                          <div className="flex items-start gap-2 px-4 py-2.5">
                            <Lightbulb className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                         <p className="text-[11px] leading-relaxed text-zinc-100 font-serif">可结合大限、流年的天干四化进行综合研判。</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 border-dashed flex justify-center items-center h-20">
                    <p className="text-[11px] text-zinc-200 font-medium">( 此命格星系暂未收录入库 )</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* 右侧核心排盘区 */}
        <main className="flex-1 flex flex-col relative w-full h-full min-h-[60vh] lg:min-h-0 items-center justify-center lg:justify-start">



          {/* 移动端悬浮调出按钮 */}
          {!isPanelVisible && (
            <button
              onClick={() => setIsPanelVisible(true)}
              className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-zinc-900 dark:bg-zinc-800 text-zinc-100 shadow-2xl lg:hidden flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-zinc-500/30 animate-in zoom-in-50 duration-300 border border-zinc-800 dark:border-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
            >
              <Settings2 className="w-6 h-6" />
            </button>
          )}

          {/* 12宫专业网格排盘区 */}
          <div className="w-full flex justify-center flex-1 h-full pt-8 lg:pt-0">
            {chartData ? (
              <div className="w-full animate-in zoom-in-[0.98] fade-in duration-700 flex flex-col">
                <ZiweiChart chartData={chartData} />
                <ChartInsightPanel chartData={chartData} />
              </div>
            ) : (
              <div className="w-full max-w-2xl mx-auto aspect-[4/3] md:aspect-video flex flex-col items-center justify-center bg-zinc-950/30 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-800 shadow-sm text-center p-8 transition-all hover:bg-zinc-950/60">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-inner relative group">
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500" />
                  <Sparkles className="w-8 h-8 text-zinc-400 group-hover:text-primary transition-colors duration-300 relative z-10" />
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-zinc-500 font-serif tracking-widest">尚未开启命轴</h3>
                <p className="text-[13px] tracking-wide text-zinc-500 mt-3 max-w-sm">
                  请在此界面 {isPanelVisible ? "左侧" : "点击悬浮按钮"} 录入生辰信息后，点击引擎执行排盘。
                </p>
                {!isPanelVisible && (
                  <button
                    onClick={() => setIsPanelVisible(true)}
                    className="mt-6 px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-800 text-zinc-100 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all border border-transparent dark:border-zinc-700/50"
                  >
                    调出参数面板
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      {/* 意见反馈浮窗 */}
      <FeedbackWidget />

      {/* 免责声明页脚 */}
      <footer className="absolute bottom-4 left-0 w-full text-center px-4 pointer-events-none z-20">
        <p className="text-[10px] md:text-[11px] text-zinc-400 font-medium tracking-widest uppercase">
          免责声明：本应用分析结果仅供学术研学与娱乐参考，切勿盲目迷信。重大决策请咨询专业人士。
        </p>
      </footer>
    </div>
  );
}
