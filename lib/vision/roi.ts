import { IDX } from "./config";
import type { BBox, FaceSample, Point, Rect, RGB } from "./types";

type NL = { x: number; y: number };

function clipRect(x1: number, y1: number, x2: number, y2: number, w: number, h: number): Rect {
  const ix1 = Math.max(0, Math.min(Math.round(x1), w - 1));
  const ix2 = Math.max(0, Math.min(Math.round(x2), w));
  const iy1 = Math.max(0, Math.min(Math.round(y1), h - 1));
  const iy2 = Math.max(0, Math.min(Math.round(y2), h));
  return { x: ix1, y: iy1, w: Math.max(1, ix2 - ix1), h: Math.max(1, iy2 - iy1) };
}

function meanColor(ctx: CanvasRenderingContext2D, r: Rect): RGB {
  const { data } = ctx.getImageData(r.x, r.y, r.w, r.h);
  let rr = 0, gg = 0, bb = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    rr += data[i];
    gg += data[i + 1];
    bb += data[i + 2];
  }
  return { r: rr / n, g: gg / n, b: bb / n };
}

/** Trích ROI (trán + 2 má) + màu trung bình cho từng khuôn mặt. */
export function extractFaces(
  faces: NL[][],
  vw: number,
  vh: number,
  ctx: CanvasRenderingContext2D,
): FaceSample[] {
  const out: FaceSample[] = [];

  for (const lm of faces) {
    const px = lm.map((p) => [p.x * vw, p.y * vh] as Point);
    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    for (const [x, y] of px) {
      if (x < xMin) xMin = x;
      if (y < yMin) yMin = y;
      if (x > xMax) xMax = x;
      if (y > yMax) yMax = y;
    }
    const bbox: BBox = [Math.round(xMin), Math.round(yMin), Math.round(xMax), Math.round(yMax)];
    const centroid: Point = [(xMin + xMax) / 2, (yMin + yMax) / 2];
    const faceW = Math.abs(px[IDX.faceR][0] - px[IDX.faceL][0]) || 1;

    // trán
    const top = px[IDX.foreheadTop][1];
    const bottom = px[IDX.glabella][1];
    const fh = Math.max(bottom - top, 1);
    const left = Math.min(px[IDX.browL][0], px[IDX.browR][0]);
    const right = Math.max(px[IDX.browL][0], px[IDX.browR][0]);
    const fw = Math.max(right - left, 1);
    const forehead = clipRect(
      left + 0.12 * fw, top + 0.32 * fh,
      right - 0.12 * fw, bottom - 0.08 * fh, vw, vh,
    );

    // hai má
    const cs = 0.11 * faceW;
    const lc = px[IDX.cheekL];
    const rc = px[IDX.cheekR];
    const cheekL = clipRect(lc[0] - cs, lc[1] - cs, lc[0] + cs, lc[1] + cs, vw, vh);
    const cheekR = clipRect(rc[0] - cs, rc[1] - cs, rc[0] + cs, rc[1] + cs, vw, vh);

    out.push({
      bbox,
      centroid,
      rois: { forehead, cheekL, cheekR },
      meanColor: {
        forehead: meanColor(ctx, forehead),
        cheekL: meanColor(ctx, cheekL),
        cheekR: meanColor(ctx, cheekR),
      },
    });
  }

  return out;
}
