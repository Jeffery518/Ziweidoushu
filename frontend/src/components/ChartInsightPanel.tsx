"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { calculateChartStats, type ChartStats, type PalaceScore } from "@/utils/palace-scorer";
import { cn } from "@/lib/utils";
import type { ZiweiChartData } from "@/components/ZiweiChart";

// ---- SVG Radar Chart ----
function RadarChart({ scores }: { scores: PalaceScore[] }) {
  const cx = 120, cy = 120, r = 90;
  const n = scores.length;
  if (n === 0) return null;

  const angleStep = (2 * Math.PI) / n;
  const getPoint = (index: number, radius: number) => {
    const angle = index * angleStep - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  // Web lines
  const levels = [0.25, 0.5, 0.75, 1.0];
  const webLines = levels.map(lv => {
    const pts = Array.from({ length: n }, (_, i) => getPoint(i, r * lv));
    return pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ') + 'Z';
  });

  // Data polygon
  const dataPts = scores.map((s, i) => getPoint(i, r * (s.score / 100)));
  const dataPath = dataPts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ') + 'Z';

  const gradeColor: Record<string, string> = { S: '#a855f7', A: '#3b82f6', B: '#22c55e', C: '#eab308', D: '#ef4444' };

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[220px] mx-auto">
      <defs>
        <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Web grid */}
      {webLines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#3f3f46" strokeWidth="0.7" />
      ))}
      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const p = getPoint(i, r);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#3f3f46" strokeWidth="0.7" />;
      })}
      {/* Data area */}
      <path d={dataPath} fill="url(#radarGrad)" stroke="#a855f7" strokeWidth="1.5" />
      {/* Data points */}
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={gradeColor[scores[i].grade] ?? '#a855f7'} stroke="white" strokeWidth="1" />
      ))}
      {/* Labels */}
      {scores.map((s, i) => {
        const lp = getPoint(i, r + 18);
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="#a1a1aa" fontFamily="serif">
            {s.palaceName.replace('宫', '')}
          </text>
        );
      })}
    </svg>
  );
}

// ---- Donut Pie Chart for Lucky/Unlucky ----
function StarPieChart({ lucky, unlucky, neutral }: { lucky: number; unlucky: number; neutral: number }) {
  const total = lucky + unlucky + neutral || 1;
  const cx = 60, cy = 60, r = 40, innerR = 25;

  const slices = [
    { value: lucky, color: '#22c55e', label: '吉星' },
    { value: unlucky, color: '#ef4444', label: '煞星' },
    { value: neutral, color: '#71717a', label: '中性' },
  ];

  let startAngle = -Math.PI / 2;
  const paths: { d: string; color: string; label: string; value: number }[] = [];

  for (const s of slices) {
    const angle = (s.value / total) * 2 * Math.PI;
    if (angle < 0.001) { startAngle += angle; continue; }
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle), y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle), y4 = cy + innerR * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    paths.push({
      d: `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} L${x3},${y3} A${innerR},${innerR},0,${large},0,${x4},${y4}Z`,
      color: s.color, label: s.label, value: s.value,
    });
    startAngle = endAngle;
  }

  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 120 120" className="w-20 h-20 flex-shrink-0">
        {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#e4e4e7" fontWeight="bold">
          {total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#71717a">星</text>
      </svg>
      <div className="flex flex-col gap-1 text-[11px]">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-zinc-400">{s.label}</span>
            <span className="text-zinc-200 font-bold ml-1">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Five Elements Bar ----
function WuxingBars({ counts }: { counts: Record<string, number> }) {
  const elements = [
    { key: '金', emoji: '🪙', color: 'from-yellow-400 to-amber-400' },
    { key: '木', emoji: '🌿', color: 'from-green-500 to-emerald-400' },
    { key: '水', emoji: '💧', color: 'from-blue-500 to-cyan-400' },
    { key: '火', emoji: '🔥', color: 'from-orange-500 to-red-400' },
    { key: '土', emoji: '🏔️', color: 'from-amber-700 to-yellow-600' },
  ];
  const max = Math.max(...elements.map(e => counts[e.key] || 0), 1);

  return (
    <div className="space-y-1.5 w-full">
      {elements.map(el => {
        const val = counts[el.key] || 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={el.key} className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 w-5">{el.emoji}</span>
            <span className="text-[11px] text-zinc-400 w-4 font-serif">{el.key}</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={cn("h-full rounded-full bg-gradient-to-r", el.color)}
              />
            </div>
            <span className="text-[10px] text-zinc-500 w-3">{val}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---- Palace Score Card ----
function ScoreCard({ ps }: { ps: PalaceScore }) {
  const gradeColors: Record<string, string> = {
    S: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
    A: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    B: 'text-green-400 border-green-500/50 bg-green-500/10',
    C: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
    D: 'text-red-400 border-red-500/50 bg-red-500/10',
  };
  const ringColors: Record<string, string> = {
    S: 'stroke-purple-400', A: 'stroke-blue-400', B: 'stroke-green-400', C: 'stroke-yellow-400', D: 'stroke-red-400'
  };
  const circumference = 2 * Math.PI * 16;
  const dashOffset = circumference * (1 - ps.score / 100);

  const scoreColor = gradeColors[ps.grade].split(' ')[0]; // e.g. "text-blue-400"
  // 将 Tailwind 颜色类转为实际颜色值供 SVG fill 使用
  const svgFillMap: Record<string, string> = {
    'text-purple-400': '#c084fc',
    'text-blue-400':   '#60a5fa',
    'text-green-400':  '#4ade80',
    'text-yellow-400': '#facc15',
    'text-red-400':    '#f87171',
  };
  const svgFill = svgFillMap[scoreColor] ?? '#e4e4e7';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("flex flex-col items-center p-3 rounded-xl border bg-zinc-900/60 backdrop-blur-sm gap-2", gradeColors[ps.grade])}
    >
      {/* SVG 圆圈 + 分数数字一体化，精确居中，无任何 margin hack */}
      <svg width="48" height="48" viewBox="0 0 42 42">
        {/* 背景圆轨 */}
        <circle cx="21" cy="21" r="16" fill="none" stroke="#27272a" strokeWidth="3.5" />
        {/* 进度弧（-90° 起点：transform 旋转圆心） */}
        <circle
          cx="21" cy="21" r="16" fill="none" strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={ringColors[ps.grade]}
          transform="rotate(-90 21 21)"
        />
        {/* 分数文字，SVG 原生居中 —— 不再依赖 CSS margin */}
        <text
          x="21" y="21"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="bold"
          fill={svgFill}
          fontFamily="ui-sans-serif,system-ui,sans-serif"
        >
          {ps.score}
        </text>
      </svg>

      <div className="text-center">
        <div className="text-[11px] font-bold text-zinc-300 font-serif">{ps.palaceName.replace('宫', '')}</div>
        <div className={cn("text-[9px] font-bold mt-0.5 px-1 py-0.5 rounded border", gradeColors[ps.grade])}>{ps.grade}级</div>
      </div>
      <div className="text-[9px] text-zinc-500 text-center leading-tight">{ps.stars}</div>
    </motion.div>
  );
}

// ---- Main Component ----
interface ChartInsightPanelProps {
  chartData: ZiweiChartData;
}

export function ChartInsightPanel({ chartData }: ChartInsightPanelProps) {
  const stats: ChartStats = useMemo(() => calculateChartStats(chartData.palaces), [chartData]);

  const overallGradeColor =
    stats.overallScore >= 85 ? 'text-purple-400' :
    stats.overallScore >= 70 ? 'text-blue-400' :
    stats.overallScore >= 55 ? 'text-green-400' :
    stats.overallScore >= 40 ? 'text-yellow-400' :
    'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-6xl mx-auto mt-6"
    >
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-950 to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="text-lg">📊</span>
            <h3 className="text-sm font-bold tracking-widest text-zinc-100 font-serif">命格分析仪表板</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500">综合评分</span>
            <span className={cn("text-2xl font-bold", overallGradeColor)}>{stats.overallScore}</span>
            <span className="text-[11px] text-zinc-400 ml-1">{stats.destinyType}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">

          {/* Column 1: Radar Chart */}
          <div className="flex flex-col items-center gap-4">
            <h4 className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">六宫强弱雷达</h4>
            <RadarChart scores={stats.palaceScores} />
          </div>

          {/* Column 2: Star Stats + Wuxing */}
          <div className="flex flex-col gap-5">
            <div>
              <h4 className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium mb-3">吉凶星分布</h4>
              <StarPieChart lucky={stats.luckyStarCount} unlucky={stats.unluckyStarCount} neutral={stats.neutralStarCount} />
            </div>
            <div>
              <h4 className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium mb-3">五行能量指数</h4>
              <WuxingBars counts={stats.wuxingCounts} />
            </div>
          </div>

          {/* Column 3: Palace Score Cards */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">关键宫位评分</h4>
            <div className="grid grid-cols-3 gap-2">
              {stats.palaceScores.map(ps => (
                <ScoreCard key={ps.palaceName} ps={ps} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
