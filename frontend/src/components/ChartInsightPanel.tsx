"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { calculateChartStats, type ChartStats, type PalaceScore } from "@/utils/palace-scorer";
import { cn } from "@/lib/utils";
import type { ZiweiChartData } from "@/components/ZiweiChart";
import { Compass, Sparkles, Shield, Heart, Briefcase, Coins, Users, Activity } from "lucide-react";

// ---- 宫位图标映射 ----
const PALACE_ICON_MAP: Record<string, React.ReactNode> = {
  "命宫": <Compass className="w-4 h-4" />,
  "财帛宫": <Coins className="w-4 h-4" />,
  "官禄宫": <Briefcase className="w-4 h-4" />,
  "夫妻宫": <Heart className="w-4 h-4" />,
  "子女宫": <Users className="w-4 h-4" />,
  "疾厄宫": <Activity className="w-4 h-4" />,
};

// ---- 宫位特质关键词 (基于倪海厦理念: 引导而非评判) ----
const PALACE_TRAIT_MAP: Record<string, { highTraits: string[]; lowTraits: string[]; guidance: string }> = {
  "命宫": {
    highTraits: ["气场强旺", "意志坚定", "格局开阔"],
    lowTraits: ["沉潜蓄力", "内修为先", "厚积薄发"],
    guidance: `修心养性是最好的良药，"位可改天命"，地理风水与自身努力才是关键。`
  },
  "财帛宫": {
    highTraits: ["财源广进", "理财有方", "正财稳健"],
    lowTraits: ["勤俭持家", "积少成多", "远离投机"],
    guidance: "理财有道、量入为出，配合正确的事业方向，财运自然提升。"
  },
  "官禄宫": {
    highTraits: ["事业宏图", "贵人扶持", "领导才能"],
    lowTraits: ["适合专精", "技术立身", "稳扎稳打"],
    guidance: "找到适合自己的赛道，三百六十行行行出状元。"
  },
  "夫妻宫": {
    highTraits: ["姻缘美好", "感情和睦", "良缘早现"],
    lowTraits: ["晚婚为宜", "慎选良配", "先立业后成家"],
    guidance: "感情讲究缘份与经营，晚婚往往是化解之道。"
  },
  "子女宫": {
    highTraits: ["多子多福", "儿女孝顺", "传承有望"],
    lowTraits: ["重质不重量", "因材施教", "缘深则聚"],
    guidance: "教育培养是最好的投资，缘分到了自然水到渠成。"
  },
  "疾厄宫": {
    highTraits: ["体质强健", "少病少灾", "元气充沛"],
    lowTraits: ["注重养生", "防患未然", "定期体检"],
    guidance: "身体是革命的本钱，日常养生与体质调理最为重要。"
  },
};

// ---- 紧凑型宫位卡片 ----
function CompactGuidanceCard({ ps, index }: { ps: PalaceScore; index: number }) {
  const traits = PALACE_TRAIT_MAP[ps.palaceName];
  if (!traits) return null;

  const isStrong = ps.score >= 70;
  const isBalanced = ps.score >= 50 && ps.score < 70;
  const displayTraits = isStrong ? traits.highTraits : traits.lowTraits;
  const energyLabel = isStrong ? "旺盛" : isBalanced ? "平和" : "蓄势";

  const icon = PALACE_ICON_MAP[ps.palaceName] || <Sparkles className="w-4 h-4" />;

  const accentColor = isStrong
    ? { border: "border-emerald-800/30", iconBg: "bg-emerald-500/10 text-emerald-400", bar: "from-emerald-500 to-cyan-400", barWidth: "w-full" }
    : isBalanced
      ? { border: "border-blue-800/30", iconBg: "bg-blue-500/10 text-blue-400", bar: "from-blue-500 to-indigo-400", barWidth: "w-3/4" }
      : { border: "border-amber-800/30", iconBg: "bg-amber-500/10 text-amber-400", bar: "from-amber-500 to-orange-400", barWidth: "w-1/2" };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group flex flex-col gap-2.5 p-4 rounded-xl border bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:bg-zinc-900/70 hover:shadow-lg",
        accentColor.border
      )}
    >
      {/* 顶部：图标 + 宫名 + 主星 + 能量条 */}
      <div className="flex items-center gap-2.5">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110", accentColor.iconBg)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-zinc-100 font-serif">{ps.palaceName}</span>
            <span className="text-[10px] text-zinc-500">{ps.stars || "空宫"}</span>
          </div>
          {/* 能量条 */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", accentColor.bar, accentColor.barWidth)} />
            </div>
            <span className="text-[9px] text-zinc-500 font-medium w-6 text-right">{energyLabel}</span>
          </div>
        </div>
      </div>

      {/* 特质标签 + 引导语 */}
      <div className="flex items-start gap-2">
        <div className="flex flex-wrap gap-1">
          {displayTraits.map((trait, i) => (
            <span
              key={i}
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-zinc-400 font-medium"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[9px] leading-relaxed text-zinc-500 font-serif">{traits.guidance}</p>
    </motion.div>
  );
}

// ---- Main Component ----
interface ChartInsightPanelProps {
  chartData: ZiweiChartData;
}

export function ChartInsightPanel({ chartData }: ChartInsightPanelProps) {
  const stats: ChartStats = useMemo(() => calculateChartStats(chartData.palaces), [chartData]);

  const destinyDescription = useMemo(() => {
    const s = stats.overallScore;
    if (s >= 85) return { label: "星光璀璨", desc: "先天格局极佳，善用天赋可成大器" };
    if (s >= 70) return { label: "稳中求进", desc: "根基扎实，稳扎稳打前途光明" };
    if (s >= 55) return { label: "平和安稳", desc: "命格平和，修身养性可开运势" };
    return { label: "厚积薄发", desc: "大器晚成，凡事先蓄力再发力" };
  }, [stats.overallScore]);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto mt-6"
    >
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-950 to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="text-lg">🌟</span>
            <h3 className="text-sm font-bold tracking-widest text-zinc-100 font-serif">关键宫位特质</h3>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-300">{destinyDescription.label}</span>
            <span className="text-[10px] text-zinc-500 ml-1 hidden sm:inline">{destinyDescription.desc}</span>
          </div>
        </div>

        {/* 宫位特质网格 — 2列×3行紧凑布局 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
          {stats.palaceScores.map((ps, idx) => (
            <CompactGuidanceCard key={ps.palaceName} ps={ps} index={idx} />
          ))}
        </div>

        {/* 底部倪师理念 */}
        <div className="px-6 py-3 border-t border-zinc-800/60 bg-zinc-900/30">
          <p className="text-[10px] text-zinc-500 text-center font-serif tracking-wider">
            💡 倪海厦老师曰：&ldquo;命虽有定数，位可改天命。&rdquo; 命盘展示的是先天象征，非绝对定论。修身养性、调整方位才是化解之道。
          </p>
        </div>
      </div>
    </motion.div>
  );
}
