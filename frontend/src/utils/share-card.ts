/**
 * 命盘分享卡片生成器
 * 用 Canvas 合成一张 960×960 方形图，适配微信/微博等社交平台分享比例。
 */

import type { ZiweiChartData } from "@/components/ZiweiChart";

const BG     = '#09090b';
const CARD   = '#18181b';
const BORDER = '#3f3f46';
const HI     = '#e4e4e7';
const MU     = '#a1a1aa';
const DIM    = '#52525b';
const PURPLE = '#a855f7';
const FONT   = '"Noto Serif SC","Source Han Serif CN","PingFang SC","Microsoft YaHei",serif';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src     = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** 生成 960×960 社交分享卡片，返回 dataURL */
export async function generateShareCard(
  chartElementId: string,
  meta: ZiweiChartData["meta"]
): Promise<string> {
  const { toPng } = await import("html-to-image");

  const chartEl = document.getElementById(chartElementId);
  if (!chartEl) throw new Error(`#${chartElementId} not found`);

  // ── 1. 截命盘图 ─────────────────────────────────────────────────────────
  const chartUrl = await toPng(chartEl, { backgroundColor: BG, pixelRatio: 2 });
  const chartImg = await loadImage(chartUrl);

  // ── 2. Canvas 布局（960 × 960） ─────────────────────────────────────────
  const S = 2;           // retina
  const SIZE   = 960 * S;
  const SIDE   = 36 * S;
  const INNER  = SIZE - SIDE * 2;

  // 命盘图尺寸（最多占 60% 高度）
  const cRatio  = chartImg.naturalHeight / chartImg.naturalWidth;
  const cW      = INNER;
  const cH      = Math.min(cW * cRatio, SIZE * 0.58);

  // 顶部区域高度
  const HEADER_H = 90 * S;
  // 信息栏高度
  const INFO_H   = 72 * S;
  const GAP      = 18 * S;
  // 底部高度
  const FOOTER_H = 40 * S;
  // 总高度（适配正方形）
  const canvasW = SIZE;
  const canvasH = SIZE;

  const canvas = document.createElement("canvas");
  canvas.width  = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;

  // 背景
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 顶部紫色渐变线
  const g1 = ctx.createLinearGradient(SIDE, 0, canvasW - SIDE, 0);
  g1.addColorStop(0, "transparent"); g1.addColorStop(0.5, PURPLE); g1.addColorStop(1, "transparent");
  ctx.strokeStyle = g1; ctx.lineWidth = 2 * S;
  ctx.beginPath(); ctx.moveTo(SIDE, 22 * S); ctx.lineTo(canvasW - SIDE, 22 * S); ctx.stroke();

  // 主标题
  ctx.fillStyle = HI;
  ctx.font = `bold ${22 * S}px ${FONT}`;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText("天纪 · 紫微斗数命盘", canvasW / 2, 52 * S);

  // 副标题
  ctx.fillStyle = PURPLE;
  ctx.font = `${10 * S}px ${FONT}`;
  ctx.fillText("TIANJI  ·  ZIWEI DOUSHU", canvasW / 2, 68 * S);

  // 信息栏卡片（两行四列）
  const infoY = HEADER_H + GAP;
  ctx.fillStyle = CARD;
  roundRect(ctx, SIDE, infoY, INNER, INFO_H, 8 * S);
  ctx.fill();
  ctx.strokeStyle = BORDER; ctx.lineWidth = 1 * S;
  roundRect(ctx, SIDE, infoY, INNER, INFO_H, 8 * S);
  ctx.stroke();

  const HALF = INNER / 2;
  const rows: [string, string][] = [
    ["命局五行", meta.wuxing_ju],
    ["命宫位置", meta.life_palace],
    ["阴阳属性", meta.yin_yang_gender ?? "—"],
    ["出生农历", meta.lunar_date_str?.replace("农历 ", "") ?? "—"],
  ];
  ctx.textAlign = "left";
  rows.forEach(([label, value], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x   = SIDE + 16 * S + col * HALF;
    const y   = infoY + 22 * S + row * 30 * S;
    ctx.fillStyle = MU;
    ctx.font = `${10 * S}px ${FONT}`;
    ctx.fillText(`${label}：`, x, y);
    const lw = ctx.measureText(`${label}：`).width;
    ctx.fillStyle = HI;
    ctx.font = `bold ${10 * S}px ${FONT}`;
    ctx.fillText(value, x + lw, y);
  });

  // 命盘截图（垂直居中剩余空间）
  const chartY = infoY + INFO_H + GAP;
  const remainH = canvasH - chartY - FOOTER_H - GAP;
  const fitH    = Math.min(cH, remainH);
  const fitW    = fitH / cRatio;
  const chartX  = (canvasW - fitW) / 2;
  ctx.drawImage(chartImg, chartX, chartY, fitW, fitH);

  // 底部分隔线
  const footerY = canvasH - FOOTER_H;
  const g2 = ctx.createLinearGradient(SIDE, 0, canvasW - SIDE, 0);
  g2.addColorStop(0, "transparent"); g2.addColorStop(0.5, BORDER); g2.addColorStop(1, "transparent");
  ctx.strokeStyle = g2; ctx.lineWidth = S;
  ctx.beginPath(); ctx.moveTo(SIDE, footerY); ctx.lineTo(canvasW - SIDE, footerY); ctx.stroke();

  // 底部水印
  ctx.fillStyle = DIM;
  ctx.font = `${9 * S}px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("文墨天纪 · 倪海厦《天纪》派紫微斗数", SIDE, footerY + 22 * S);
  ctx.textAlign = "right";
  ctx.fillText(new Date().toLocaleDateString("zh-CN"), canvasW - SIDE, footerY + 22 * S);

  // 右下角圆形生成标记
  const BADGE_R = 18 * S;
  const BADGE_X = canvasW - SIDE - BADGE_R;
  const BADGE_Y = footerY - BADGE_R - 6 * S;
  ctx.beginPath(); ctx.arc(BADGE_X, BADGE_Y, BADGE_R, 0, Math.PI * 2);
  ctx.fillStyle = PURPLE + "33"; ctx.fill();
  ctx.strokeStyle = PURPLE; ctx.lineWidth = S;
  ctx.stroke();
  ctx.fillStyle = PURPLE;
  ctx.font = `bold ${8 * S}px ${FONT}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("紫微", BADGE_X, BADGE_Y);

  return canvas.toDataURL("image/png");
}
