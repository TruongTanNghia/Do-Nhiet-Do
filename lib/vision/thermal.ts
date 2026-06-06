import { LUTS, type PaletteName } from "./palette";

export interface Glow {
  cx: number;
  cy: number;
  fw: number;
  fh: number;
  heat: number; // 0..1 theo nhiệt độ
}

/**
 * Tạo ImageData ảnh nhiệt giả lập: nền lạnh (theo độ sáng), mặt phát vùng nóng.
 * src nên ở độ phân giải nhỏ để mượt; upscale khi vẽ sẽ tạo blur đẹp.
 */
export function renderThermal(src: ImageData, glows: Glow[], palette: PaletteName): ImageData {
  const { width: w, height: h, data } = src;
  const heat = new Float32Array(w * h);

  // Nền: độ sáng * 0.42 -> luôn ở dải lạnh.
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const gray = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    heat[p] = gray * 0.42;
  }

  // Glow theo từng khuôn mặt.
  for (const g of glows) {
    const amp = 0.55 + 0.45 * g.heat;
    const sigx = Math.max(0.55 * g.fw, 1);
    const sigy = Math.max(0.65 * g.fh, 1);
    const x0 = Math.max(0, Math.floor(g.cx - 2 * sigx));
    const x1 = Math.min(w, Math.ceil(g.cx + 2 * sigx));
    const y0 = Math.max(0, Math.floor(g.cy - 2 * sigy));
    const y1 = Math.min(h, Math.ceil(g.cy + 2 * sigy));
    for (let y = y0; y < y1; y++) {
      const dy = (y - g.cy) ** 2 / (2 * sigy * sigy);
      for (let x = x0; x < x1; x++) {
        const gauss = Math.exp(-((x - g.cx) ** 2 / (2 * sigx * sigx) + dy));
        const p = y * w + x;
        heat[p] = heat[p] * (1 - gauss) + amp * gauss;
      }
    }
  }

  // Áp colormap.
  const lut = LUTS[palette];
  const out = new ImageData(w, h);
  const od = out.data;
  for (let p = 0, i = 0; p < heat.length; p++, i += 4) {
    let v = Math.round(heat[p] * 255);
    if (v < 0) v = 0;
    else if (v > 255) v = 255;
    od[i] = lut[v * 3];
    od[i + 1] = lut[v * 3 + 1];
    od[i + 2] = lut[v * 3 + 2];
    od[i + 3] = 255;
  }
  return out;
}
