/**
 * 命盘 PDF 导出工具 v3
 *
 * 方案：Canvas 合成法
 *  1. 用 html-to-image 对命盘 DOM 元素截图（仅命盘，不含文字）
 *  2. 用原生 Canvas API 在内存中合成完整卡片：
 *       - 深色背景
 *       - 顶部装饰线、标题、子标题
 *       - 命造信息栏
 *       - 命盘截图
 *       - 底部水印
 *     Canvas 上的文字由浏览器字体渲染，支持中文，不依赖 jsPDF 字体。
 *  3. 将合成后的图片嵌入 jsPDF A4 页面输出。
 *
 * 优势：完全摆脱离屏 DOM + html-to-image 白页 & jsPDF 中文乱码两个坑。
 */

export interface ExportMeta {
  name?: string;
  lifepalace: string;
  wuxingJu: string;
  yinYangGender: string;
  lunarDateStr?: string;
  overallScore?: number;
  destinyType?: string;
}

const BG      = '#09090b';   // zinc-950
const CARD_BG = '#18181b';   // zinc-900
const BORDER  = '#3f3f46';   // zinc-700
const TEXT_HI = '#e4e4e7';   // zinc-200
const TEXT_MU = '#a1a1aa';   // zinc-400
const TEXT_DIM= '#52525b';   // zinc-600
const PURPLE  = '#a855f7';   // purple-500

// ─── 辅助：画圆角矩形 ────────────────────────────────────────────────────────
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

// ─── 辅助：将 data-URL 加载为 HTMLImageElement ───────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** 导出完整命盘 PDF（A4 竖向，Canvas 合成，无乱码） */
export async function exportChartPDF(
  chartElementId: string,
  meta: ExportMeta
): Promise<void> {
  const [{ default: jsPDF }, { toPng }] = await Promise.all([
    import('jspdf'),
    import('html-to-image'),
  ]);

  const chartEl = document.getElementById(chartElementId);
  if (!chartEl) throw new Error(`#${chartElementId} not found`);

  // ── 1. 命盘区域截图 ──────────────────────────────────────────────────────
  const chartDataUrl = await toPng(chartEl, {
    backgroundColor: BG,
    pixelRatio: 2,
    skipFonts: false,
  });
  const chartImg = await loadImage(chartDataUrl);

  // ── 2. Canvas 尺寸规划 ───────────────────────────────────────────────────
  const SCALE   = 2;          // retina
  const CW      = 794 * SCALE; // A4 @ 96dpi = 794px
  const SIDE    = 40 * SCALE;  // 左右边距
  const INNER   = CW - SIDE * 2;

  // 信息行
  const infoItems: [string, string][] = [
    ['命主姓名', meta.name ?? '—'],
    ['命局五行', meta.wuxingJu],
    ['阴阳属性', meta.yinYangGender],
    ['命宫位置', meta.lifepalace],
  ];
  if (meta.lunarDateStr)             infoItems.push(['农历生辰', meta.lunarDateStr]);
  if (meta.overallScore != null)     infoItems.push(['综合评分', `${meta.overallScore} 分`]);
  if (meta.destinyType)              infoItems.push(['命格类型', meta.destinyType]);

  const INFO_ROW_H  = 32 * SCALE;
  const INFO_ROWS   = Math.ceil(infoItems.length / 2);
  const INFO_H      = INFO_ROWS * INFO_ROW_H + 28 * SCALE;

  // 命盘图片高度（保比例）
  const chartW      = INNER;
  const chartH      = Math.round(chartW * (chartImg.naturalHeight / chartImg.naturalWidth));

  const HEADER_H    = 88  * SCALE;  // 顶线 + 主标题 + 副标题
  const GAP         = 20  * SCALE;
  const FOOTER_H    = 36  * SCALE;

  const CH = HEADER_H + GAP + INFO_H + GAP + chartH + GAP + FOOTER_H;

  // ── 3. 创建 Canvas 并绘制 ─────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width  = CW;
  canvas.height = CH;
  const ctx = canvas.getContext('2d')!;

  // 背景
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CW, CH);

  // -- 顶部装饰线（紫色渐变）
  let lineY = 20 * SCALE;
  const grad = ctx.createLinearGradient(SIDE, 0, CW - SIDE, 0);
  grad.addColorStop(0,   'transparent');
  grad.addColorStop(0.5, PURPLE);
  grad.addColorStop(1,   'transparent');
  ctx.strokeStyle = grad;
  ctx.lineWidth   = 1.5 * SCALE;
  ctx.beginPath();
  ctx.moveTo(SIDE, lineY);
  ctx.lineTo(CW - SIDE, lineY);
  ctx.stroke();

  // -- 主标题
  ctx.fillStyle  = TEXT_HI;
  ctx.font       = `bold ${26 * SCALE}px "Noto Serif SC","Source Han Serif CN","PingFang SC","Microsoft YaHei",serif`;
  ctx.textAlign  = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('天纪 · 紫微斗数命盘', CW / 2, 54 * SCALE);

  // -- 副标题
  ctx.fillStyle  = PURPLE;
  ctx.font       = `${11 * SCALE}px "Noto Serif SC","Source Han Serif CN","PingFang SC","Microsoft YaHei",serif`;
  ctx.letterSpacing = `${3 * SCALE}px`;
  ctx.fillText('TIANJI  ·  ZIWEI DOUSHU', CW / 2, 76 * SCALE);
  ctx.letterSpacing = '0px';

  // -- 信息栏卡片
  const infoCardX = SIDE;
  const infoCardY = HEADER_H + GAP;
  const infoCardW = INNER;
  const infoCardH = INFO_H;

  ctx.fillStyle = CARD_BG;
  roundRect(ctx, infoCardX, infoCardY, infoCardW, infoCardH, 8 * SCALE);
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth   = 1 * SCALE;
  roundRect(ctx, infoCardX, infoCardY, infoCardW, infoCardH, 8 * SCALE);
  ctx.stroke();

  // 信息行（每行分左右两列）
  const colW = INNER / 2;
  ctx.textAlign = 'left';
  ctx.font = `${12.5 * SCALE}px "Noto Serif SC","Source Han Serif CN","PingFang SC","Microsoft YaHei",serif`;

  infoItems.forEach(([label, value], idx) => {
    const col  = idx % 2;
    const row  = Math.floor(idx / 2);
    const x    = infoCardX + 20 * SCALE + col * colW;
    const y    = infoCardY + 20 * SCALE + row * INFO_ROW_H + 18 * SCALE;

    ctx.fillStyle = TEXT_MU;
    ctx.fillText(`${label}：`, x, y);
    const labelW = ctx.measureText(`${label}：`).width;

    // 命格类型用紫色高亮
    ctx.fillStyle = label === '命格类型' ? PURPLE : TEXT_HI;
    ctx.font = `bold ${12.5 * SCALE}px "Noto Serif SC","Source Han Serif CN","PingFang SC","Microsoft YaHei",serif`;
    ctx.fillText(value, x + labelW, y);
    ctx.font = `${12.5 * SCALE}px "Noto Serif SC","Source Han Serif CN","PingFang SC","Microsoft YaHei",serif`;
  });

  // -- 命盘截图
  const chartDrawY = infoCardY + infoCardH + GAP;
  ctx.drawImage(chartImg, SIDE, chartDrawY, chartW, chartH);

  // -- 底部分隔线
  const footerY = chartDrawY + chartH + GAP;
  const fGrad = ctx.createLinearGradient(SIDE, 0, CW - SIDE, 0);
  fGrad.addColorStop(0,   'transparent');
  fGrad.addColorStop(0.5, BORDER);
  fGrad.addColorStop(1,   'transparent');
  ctx.strokeStyle = fGrad;
  ctx.lineWidth   = 1 * SCALE;
  ctx.beginPath();
  ctx.moveTo(SIDE, footerY);
  ctx.lineTo(CW - SIDE, footerY);
  ctx.stroke();

  // -- 底部水印文字
  const nowStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillStyle  = TEXT_DIM;
  ctx.font       = `${10 * SCALE}px "Noto Serif SC","Source Han Serif CN","PingFang SC","Microsoft YaHei",serif`;
  ctx.textAlign  = 'left';
  ctx.fillText('文墨天纪 · 倪海厦《天纪》派别专业排盘引擎', SIDE, footerY + 18 * SCALE);
  ctx.textAlign  = 'right';
  ctx.fillText(`生成日期：${nowStr}`, CW - SIDE, footerY + 18 * SCALE);

  // ── 4. 导出 PDF ──────────────────────────────────────────────────────────
  const composedDataUrl = canvas.toDataURL('image/png');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const PAGE_H = 297;

  // 按 A4 宽满铺，若高度超出按比例缩放
  const ratio    = CH / CW;
  const imgW     = PAGE_W;
  const imgH     = imgW * ratio;
  const finalW   = imgH <= PAGE_H ? imgW : PAGE_W * (PAGE_H / imgH);
  const finalH   = Math.min(imgH, PAGE_H);
  const offsetX  = (PAGE_W - finalW) / 2;
  const offsetY  = (PAGE_H - finalH) / 2;

  pdf.addImage(composedDataUrl, 'PNG', offsetX, offsetY, finalW, finalH);

  const filename = `天纪命盘_${(meta.name ?? '命主').replace(/\s+/g, '')}_${Date.now()}.pdf`;
  pdf.save(filename);
}
