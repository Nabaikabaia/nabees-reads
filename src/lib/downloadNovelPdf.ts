import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { api } from "@/lib/api";
import type { Novel, Chapter } from "@/types/novel";

type ProgressCb = (msg: string, pct: number) => void;

const PAGE = { w: 595.28, h: 841.89 }; // A4 in pt
const M = 56; // margin
const CONTENT_W = PAGE.w - M * 2;

// Brand palette (matches app blue->purple gradient)
const BRAND = {
  primary: [37, 99, 235] as [number, number, number], // blue-600
  accent: [147, 51, 234] as [number, number, number], // purple-600
  ink: [17, 24, 39] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  paper: [253, 252, 250] as [number, number, number],
  card: [243, 244, 246] as [number, number, number],
};

const SITE_NAME = "Nabees Novel Hub";

function getDomain(): string {
  if (typeof window === "undefined") return "";
  return window.location.host;
}

function sanitizeFilename(s: string) {
  return s.replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 80) || "novel";
}

async function fetchImageDataUrl(url: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const data = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 600, h: 800 });
      img.src = data;
    });
    return { data, w: dims.w, h: dims.h };
  } catch {
    return null;
  }
}

// Draw a vertical gradient by stacking thin rects
function drawGradient(
  pdf: jsPDF,
  x: number, y: number, w: number, h: number,
  from: [number, number, number], to: [number, number, number],
  steps = 60
) {
  const sh = h / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(from[0] + (to[0] - from[0]) * t);
    const g = Math.round(from[1] + (to[1] - from[1]) * t);
    const b = Math.round(from[2] + (to[2] - from[2]) * t);
    pdf.setFillColor(r, g, b);
    pdf.rect(x, y + i * sh, w, sh + 0.5, "F");
  }
}

function setColor(pdf: jsPDF, c: [number, number, number]) {
  pdf.setTextColor(c[0], c[1], c[2]);
}

function pageFooter(pdf: jsPDF, pageNum: number, totalLabel?: string) {
  setColor(pdf, BRAND.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(SITE_NAME, M, PAGE.h - 24);
  const right = totalLabel || `${pageNum}`;
  pdf.text(right, PAGE.w - M, PAGE.h - 24, { align: "right" });
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.line(M, PAGE.h - 34, PAGE.w - M, PAGE.h - 34);
}

function addBodyPageBg(pdf: jsPDF) {
  pdf.setFillColor(...BRAND.paper);
  pdf.rect(0, 0, PAGE.w, PAGE.h, "F");
}

async function buildCoverPage(pdf: jsPDF, novel: Novel) {
  // Full-bleed gradient
  drawGradient(pdf, 0, 0, PAGE.w, PAGE.h, BRAND.primary, BRAND.accent, 80);

  // Subtle dark overlay band bottom for text contrast
  pdf.setFillColor(0, 0, 0);
  pdf.setGState(new (pdf as any).GState({ opacity: 0.25 }));
  pdf.rect(0, PAGE.h * 0.55, PAGE.w, PAGE.h * 0.45, "F");
  pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

  // Brand label
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(255, 255, 255);
  pdf.text(SITE_NAME.toUpperCase(), M, 70, { charSpace: 2 });

  // Cover image card
  if (novel.cover?.url) {
    const img = await fetchImageDataUrl(novel.cover.url);
    if (img) {
      const targetW = 220;
      const ratio = img.h / img.w;
      const targetH = targetW * ratio;
      const x = (PAGE.w - targetW) / 2;
      const y = 110;
      // shadow
      pdf.setFillColor(0, 0, 0);
      pdf.setGState(new (pdf as any).GState({ opacity: 0.25 }));
      pdf.roundedRect(x + 6, y + 8, targetW, targetH, 8, 8, "F");
      pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
      const fmt = img.data.includes("image/png") ? "PNG" : "JPEG";
      try {
        pdf.addImage(img.data, fmt, x, y, targetW, targetH, undefined, "FAST");
      } catch {
        // ignore
      }
    }
  }

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  const titleLines = pdf.splitTextToSize(novel.title, CONTENT_W);
  let ty = PAGE.h * 0.66;
  titleLines.slice(0, 4).forEach((line: string) => {
    pdf.text(line, PAGE.w / 2, ty, { align: "center" });
    ty += 32;
  });

  // Author
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(13);
  pdf.setTextColor(230, 230, 230);
  pdf.text(`by ${novel.author || "Unknown"}`, PAGE.w / 2, ty + 8, { align: "center" });

  // Meta pills
  const pills = [
    novel.novelStatusDesc || (novel.novelStatus === 1 ? "Ongoing" : "Completed"),
    `${novel.totalChapters} chapters`,
    novel.totalWordsFormat ? `${novel.totalWordsFormat} words` : null,
    novel.score ? `★ ${novel.score}` : null,
  ].filter(Boolean) as string[];

  let px = M;
  const py = PAGE.h - 90;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pills.forEach((p) => {
    const tw = pdf.getTextWidth(p) + 18;
    if (px + tw > PAGE.w - M) return;
    pdf.setFillColor(255, 255, 255);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.18 }));
    pdf.roundedRect(px, py - 12, tw, 20, 10, 10, "F");
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
    pdf.setTextColor(255, 255, 255);
    pdf.text(p, px + 9, py + 2);
    px += tw + 6;
  });

  // Bottom domain
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text(getDomain(), PAGE.w / 2, PAGE.h - 40, { align: "center" });
}

function buildAboutPage(pdf: jsPDF, novel: Novel, pageNum: number) {
  addBodyPageBg(pdf);

  // Header strip
  drawGradient(pdf, 0, 0, PAGE.w, 6, BRAND.primary, BRAND.accent, 20);

  setColor(pdf, BRAND.muted);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("ABOUT THIS NOVEL", M, 50, { charSpace: 2 });

  setColor(pdf, BRAND.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  const titleLines = pdf.splitTextToSize(novel.title, CONTENT_W);
  let y = 80;
  titleLines.forEach((l: string) => {
    pdf.text(l, M, y);
    y += 26;
  });

  setColor(pdf, BRAND.muted);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(11);
  pdf.text(`by ${novel.author || "Unknown"}`, M, y);
  y += 24;

  // Genres line
  if (novel.genres?.length) {
    setColor(pdf, BRAND.primary);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(novel.genres.join("  •  ").toUpperCase(), M, y, { charSpace: 1 });
    y += 22;
  }

  // Stat row card
  const cardY = y + 4;
  const cardH = 56;
  pdf.setFillColor(...BRAND.card);
  pdf.roundedRect(M, cardY, CONTENT_W, cardH, 8, 8, "F");
  const stats = [
    { l: "Chapters", v: String(novel.totalChapters || "—") },
    { l: "Words", v: novel.totalWordsFormat || "—" },
    { l: "Rating", v: novel.score || "—" },
    { l: "Status", v: novel.novelStatusDesc || (novel.novelStatus === 1 ? "Ongoing" : "Completed") },
  ];
  const colW = CONTENT_W / stats.length;
  stats.forEach((s, i) => {
    const cx = M + colW * i + colW / 2;
    setColor(pdf, BRAND.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(s.l.toUpperCase(), cx, cardY + 20, { align: "center", charSpace: 1 });
    setColor(pdf, BRAND.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(s.v, cx, cardY + 40, { align: "center" });
  });
  y = cardY + cardH + 30;

  // Synopsis
  setColor(pdf, BRAND.muted);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("SYNOPSIS", M, y, { charSpace: 2 });
  y += 18;

  setColor(pdf, BRAND.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const summary = (novel.summary || "No synopsis available.").replace(/\s+/g, " ").trim();
  const lines = pdf.splitTextToSize(summary, CONTENT_W);
  const maxY = PAGE.h - 80;
  for (const line of lines) {
    if (y > maxY) break;
    pdf.text(line, M, y);
    y += 16;
  }

  pageFooter(pdf, pageNum);
}

function ensureSpace(pdf: jsPDF, y: number, needed: number, pageNum: { n: number }): number {
  if (y + needed > PAGE.h - 60) {
    pageFooter(pdf, pageNum.n);
    pdf.addPage();
    pageNum.n += 1;
    addBodyPageBg(pdf);
    drawGradient(pdf, 0, 0, PAGE.w, 4, BRAND.primary, BRAND.accent, 20);
    return 60;
  }
  return y;
}

function addChapter(
  pdf: jsPDF,
  ch: { name: string; content: string; index: number },
  pageNum: { n: number }
) {
  // New page for each chapter
  pdf.addPage();
  pageNum.n += 1;
  addBodyPageBg(pdf);
  drawGradient(pdf, 0, 0, PAGE.w, 4, BRAND.primary, BRAND.accent, 20);

  setColor(pdf, BRAND.muted);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(`CHAPTER ${ch.index}`, M, 60, { charSpace: 2 });

  setColor(pdf, BRAND.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  const titleLines = pdf.splitTextToSize(ch.name, CONTENT_W);
  let y = 88;
  titleLines.forEach((l: string) => {
    pdf.text(l, M, y);
    y += 22;
  });

  // Divider
  pdf.setDrawColor(...BRAND.primary);
  pdf.setLineWidth(2);
  pdf.line(M, y, M + 40, y);
  y += 24;

  setColor(pdf, BRAND.ink);
  pdf.setFont("times", "normal");
  pdf.setFontSize(11);
  const paragraphs = ch.content.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  for (const para of paragraphs) {
    const lines = pdf.splitTextToSize(para, CONTENT_W);
    for (const line of lines) {
      y = ensureSpace(pdf, y, 14, pageNum);
      pdf.text(line, M, y);
      y += 15;
    }
    y += 8;
  }

  pageFooter(pdf, pageNum.n);
}

async function buildLastPage(pdf: jsPDF, pageNum: number) {
  pdf.addPage();
  drawGradient(pdf, 0, 0, PAGE.w, PAGE.h, BRAND.primary, BRAND.accent, 80);

  // Card
  const cardX = M;
  const cardY = 80;
  const cardW = CONTENT_W;
  const cardH = PAGE.h - 160;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(cardX, cardY, cardW, cardH, 16, 16, "F");

  // Try to capture a screenshot of the current site
  let shot: { data: string; w: number; h: number } | null = null;
  try {
    const canvas = await html2canvas(document.documentElement, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      windowWidth: 1280,
      windowHeight: 800,
      scale: 1,
      logging: false,
    });
    const data = canvas.toDataURL("image/jpeg", 0.85);
    shot = { data, w: canvas.width, h: canvas.height };
  } catch {
    shot = null;
  }

  // Shot area
  const padX = 24;
  const shotW = cardW - padX * 2;
  const shotH = 260;
  const shotY = cardY + 28;
  pdf.setFillColor(...BRAND.card);
  pdf.roundedRect(cardX + padX, shotY, shotW, shotH, 10, 10, "F");
  if (shot) {
    const ratio = shot.h / shot.w;
    let drawW = shotW;
    let drawH = drawW * ratio;
    if (drawH > shotH) {
      drawH = shotH;
      drawW = drawH / ratio;
    }
    const sx = cardX + padX + (shotW - drawW) / 2;
    const sy = shotY + (shotH - drawH) / 2;
    try {
      pdf.addImage(shot.data, "JPEG", sx, sy, drawW, drawH, undefined, "FAST");
    } catch {
      // ignore
    }
  } else {
    setColor(pdf, BRAND.muted);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(11);
    pdf.text("Preview unavailable", cardX + cardW / 2, shotY + shotH / 2, { align: "center" });
  }

  // Headline
  let ty = shotY + shotH + 40;
  setColor(pdf, BRAND.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Read more interesting novels at", cardX + cardW / 2, ty, { align: "center" });
  ty += 30;

  // Brand name with gradient-ish color
  setColor(pdf, BRAND.primary);
  pdf.setFontSize(26);
  pdf.text(SITE_NAME, cardX + cardW / 2, ty, { align: "center" });
  ty += 28;

  // Domain pill
  const domain = getDomain();
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  const dw = pdf.getTextWidth(domain) + 28;
  const dx = cardX + (cardW - dw) / 2;
  pdf.setFillColor(...BRAND.card);
  pdf.roundedRect(dx, ty - 12, dw, 22, 11, 11, "F");
  setColor(pdf, BRAND.ink);
  pdf.text(domain, cardX + cardW / 2, ty + 3, { align: "center" });
  ty += 36;

  // QR code
  try {
    const qrUrl = `${window.location.protocol}//${domain}`;
    const qr = await QRCode.toDataURL(qrUrl, { margin: 0, width: 240, color: { dark: "#111827", light: "#ffffff" } });
    const qrSize = 96;
    pdf.addImage(qr, "PNG", cardX + cardW / 2 - qrSize / 2, ty, qrSize, qrSize);
    ty += qrSize + 14;
    setColor(pdf, BRAND.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Scan to explore the library", cardX + cardW / 2, ty, { align: "center" });
  } catch {
    // ignore
  }

  pageFooter(pdf, pageNum);
}

async function pMapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>, onEach?: (i: number) => void): Promise<R[]> {
  const ret: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const cur = i++;
      if (cur >= items.length) return;
      try {
        ret[cur] = await fn(items[cur], cur);
      } catch {
        ret[cur] = undefined as unknown as R;
      }
      onEach?.(cur);
    }
  });
  await Promise.all(workers);
  return ret;
}

export async function downloadNovelPdf(novel: Novel, onProgress?: ProgressCb) {
  onProgress?.("Preparing…", 2);

  // 1. Collect all chapters list (paged)
  const allChapters: Chapter[] = [];
  let page = 1;
  const pageSize = 200;
  while (true) {
    const res = await api.getChapters(novel.novelId, "ASC", page, pageSize);
    const list = res.chapterList || [];
    allChapters.push(...list);
    onProgress?.(`Fetched chapter list (${allChapters.length})`, 5);
    if (!res.pager?.hasMore || list.length === 0) break;
    page += 1;
    if (page > 200) break; // safety
  }

  if (allChapters.length === 0) {
    throw new Error("No chapters available");
  }

  // 2. Fetch contents with concurrency
  const total = allChapters.length;
  let done = 0;
  const contents = await pMapLimit(
    allChapters,
    6,
    async (ch) => {
      const c = await api.getChapter(ch.chapterId);
      return { name: ch.chapterName, content: c?.content || "" };
    },
    () => {
      done += 1;
      const pct = 5 + Math.round((done / total) * 75);
      onProgress?.(`Downloading chapters (${done}/${total})`, pct);
    }
  );

  // 3. Build PDF
  onProgress?.("Compiling PDF…", 82);
  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });

  // Cover
  await buildCoverPage(pdf, novel);

  // About
  pdf.addPage();
  const pageNum = { n: 2 };
  buildAboutPage(pdf, novel, pageNum.n);

  // Chapters
  for (let i = 0; i < contents.length; i++) {
    const c = contents[i];
    if (!c) continue;
    addChapter(pdf, { name: c.name, content: c.content, index: i + 1 }, pageNum);
    if (i % 5 === 0) {
      onProgress?.(`Compiling chapter ${i + 1}/${contents.length}`, 82 + Math.round(((i + 1) / contents.length) * 14));
      // Yield to UI
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // Last promo page
  onProgress?.("Adding back cover…", 97);
  await buildLastPage(pdf, pageNum.n + 1);

  onProgress?.("Saving…", 99);
  pdf.save(`${sanitizeFilename(novel.title)}.pdf`);
  onProgress?.("Done", 100);
}
