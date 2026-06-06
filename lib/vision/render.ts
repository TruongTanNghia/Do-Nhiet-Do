import { LUTS, type PaletteName } from "./palette";
import type { RenderPerson } from "./types";

const COLORS: Record<string, string> = {
  OK: "#00c800",
  WATCH: "#ffbe00",
  HIGH: "#ff0000",
};

type Ctx = CanvasRenderingContext2D;

function label(ctx: Ctx, text: string, x: number, y: number, color: string) {
  ctx.font = "600 15px monospace";
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = "rgba(15,15,20,0.85)";
  ctx.fillRect(x, y - 18, tw + 10, 21);
  ctx.fillStyle = color;
  ctx.fillText(text, x + 5, y - 3);
}

export function drawFace(ctx: Ctx, p: RenderPerson, showRois = true) {
  const color = COLORS[p.status] ?? "#00c800";
  const [x1, y1, x2, y2] = p.bbox;
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

  if (showRois) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(200,200,200,0.8)";
    for (const r of [p.rois.forehead, p.rois.cheekL, p.rois.cheekR]) {
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
  }

  label(ctx, `ID ${p.id}  ${p.temp.toFixed(1)}C  risk ${Math.round(p.risk)}%  ${p.status}`,
    x1, Math.max(y1, 22), color);
}

export function drawSpot(ctx: Ctx, p: RenderPerson) {
  const [cx, cy] = p.centroid;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy);
  ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "500 14px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${p.temp.toFixed(1)}C`, cx + 12, cy - 8);
}

export function drawBanner(ctx: Ctx, w: number) {
  ctx.fillStyle = "rgba(15,15,20,0.92)";
  ctx.fillRect(0, 0, w, 30);
  ctx.font = "700 15px sans-serif";
  ctx.fillStyle = "#ffdc78";
  ctx.fillText("AI FEVER RISK", 10, 21);
  ctx.font = "500 13px sans-serif";
  ctx.fillStyle = "#5a5aff";
  ctx.fillText("ESTIMATED ONLY - NOT a medical device", w - 320, 21);
}

export function drawHud(ctx: Ctx, w: number, h: number, fps: number, faces: number, mode: string) {
  ctx.font = "500 13px monospace";
  ctx.fillStyle = "#b4ffb4";
  ctx.fillText(`${fps.toFixed(1)} FPS | faces: ${faces} | ${mode.toUpperCase()}`, 10, h - 10);
}

export function drawColorbar(ctx: Ctx, w: number, h: number, palette: PaletteName, lo: number, hi: number) {
  const barH = Math.round(h * 0.46);
  const barW = 14;
  const x = w - 46;
  const y = Math.round(h * 0.26);
  const lut = LUTS[palette];
  for (let i = 0; i < barH; i++) {
    const t = 1 - i / barH;
    const v = Math.round(t * 255);
    ctx.fillStyle = `rgb(${lut[v * 3]},${lut[v * 3 + 1]},${lut[v * 3 + 2]})`;
    ctx.fillRect(x, y + i, barW, 1);
  }
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, barW, barH);
  ctx.font = "500 12px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(hi.toFixed(1), x - 16, y + 6);
  ctx.fillText(lo.toFixed(1), x - 16, y + barH + 4);
}
