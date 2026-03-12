/**
 * 宫位评分算法 — 天纪紫微派命格评分系统
 * 评分维度: 主星亮度(40) + 吉凶星加持(30) + 四化影响(30) = 100分满分
 */

export interface PalaceScore {
  palaceName: string;
  score: number;          // 0-100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  stars: string;
  summary: string;
}

export interface ChartStats {
  luckyStarCount: number;
  unluckyStarCount: number;
  neutralStarCount: number;
  wuxingCounts: Record<string, number>;
  palaceScores: PalaceScore[];
  overallScore: number;
  destinyType: string;
}

// 亮度分值映射
const BRIGHTNESS_SCORE: Record<string, number> = {
  '庙': 10, '旺': 9, '得': 7, '平': 5, '陷': 0
};

// 吉星列表
const LUCKY_STARS = new Set(['左辅','右弼','文昌','文曲','天魁','天钺','禄存','天马','红鸾','天喜']);
// 凶星列表
const UNLUCKY_STARS = new Set(['擎羊','陀罗','火星','铃星','地空','地劫','咸池','天姚']);

// 五行对应
const STAR_WUXING: Record<string, string> = {
  '紫微':'土', '天机':'木', '太阳':'火', '武曲':'金', '天同':'水', '廉贞':'火',
  '天府':'土', '太阴':'水', '贪狼':'木', '巨门':'水', '天相':'水', '天梁':'土',
  '七杀':'金', '破军':'水'
};

// 四化分值
const SIHUA_SCORE: Record<string, number> = {
  '化禄': 15, '化权': 12, '化科': 10, '化忌': -10
};

// 关键宫位列表
const KEY_PALACES = ['命宫', '财帛宫', '官禄宫', '夫妻宫', '子女宫', '疾厄宫'];

// 宫位简介生成
function getPalaceSummary(palaceName: string, score: number): string {
  const qualifiers =
    score >= 85 ? '极为强旺' :
    score >= 70 ? '气质优秀' :
    score >= 55 ? '平稳中正' :
    score >= 40 ? '略显不足' :
    '需要留意';
  return `${palaceName.replace('宫', '')}${qualifiers}`;
}

function scoreGrade(score: number): PalaceScore['grade'] {
  if (score >= 85) return 'S';
  if (score >= 70) return 'A';
  if (score >= 55) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

export function calculateChartStats(palaces: Array<{
  name: string;
  major_stars: string[];
  minor_stars: string[];
  transformations: string[];
  star_brightness?: Record<string, string>;
  branch: string;
  palace_score?: number;
}>): ChartStats {
  let totalLucky = 0, totalUnlucky = 0, totalNeutral = 0;
  const wuxingCounts: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  const palaceScores: PalaceScore[] = [];

  for (const p of palaces) {
    const allStars = [...p.major_stars, ...p.minor_stars];
    for (const star of allStars) {
      if (LUCKY_STARS.has(star)) totalLucky++;
      else if (UNLUCKY_STARS.has(star)) totalUnlucky++;
      else totalNeutral++;
      if (STAR_WUXING[star]) wuxingCounts[STAR_WUXING[star]]++;
    }

    // 仅对关键宫位评分
    if (KEY_PALACES.includes(p.name)) {
      let score = 0;

      if (p.palace_score !== undefined) {
        // 优先使用后端计算的权重分
        score = p.palace_score;
      } else {
        // 前端兜底计算逻辑
        score = 30; // 基础分
        let brightnessTotal = 0;
        for (const star of p.major_stars) {
          const bri = p.star_brightness?.[star] ?? '';
          brightnessTotal += BRIGHTNESS_SCORE[bri] ?? 5;
        }
        score += Math.min(40, p.major_stars.length > 0 ? Math.round(brightnessTotal / p.major_stars.length * 4) : 20);

        let luckBonus = 0;
        for (const star of p.minor_stars) {
          if (LUCKY_STARS.has(star)) luckBonus += 6;
          if (UNLUCKY_STARS.has(star)) luckBonus -= 8;
        }
        score += Math.max(-20, Math.min(30, luckBonus));

        let sihuaBonus = 0;
        for (const t of p.transformations) {
          for (const [key, val] of Object.entries(SIHUA_SCORE)) {
            if (t.includes(key.replace('化',''))) sihuaBonus += val;
          }
        }
        score += Math.max(-20, Math.min(30, sihuaBonus));
      }

      score = Math.max(10, Math.min(100, score));

      palaceScores.push({
        palaceName: p.name,
        score,
        grade: scoreGrade(score),
        stars: p.major_stars.join('、') || '空宫',
        summary: getPalaceSummary(p.name, score),
      });
    }
  }

  // 整体命格分 = 关键宫位均值
  const overallScore = palaceScores.length > 0
    ? Math.round(palaceScores.reduce((s, p) => s + p.score, 0) / palaceScores.length)
    : 50;

  const destinyType =
    overallScore >= 85 ? '上格贵命' :
    overallScore >= 70 ? '中上之格' :
    overallScore >= 55 ? '平常之命' :
    '需修炼之格';

  return {
    luckyStarCount: totalLucky,
    unluckyStarCount: totalUnlucky,
    neutralStarCount: totalNeutral,
    wuxingCounts,
    palaceScores,
    overallScore,
    destinyType,
  };
}
