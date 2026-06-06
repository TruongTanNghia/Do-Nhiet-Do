// Bảng màu nhiệt (LUT 256 màu) dựng từ các điểm mốc, dùng cho chế độ ảnh nhiệt.
type Stop = [number, [number, number, number]];

function buildLUT(stops: Stop[]): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) {
        a = stops[s];
        b = stops[s + 1];
        break;
      }
    }
    const span = b[0] - a[0] || 1;
    const f = (t - a[0]) / span;
    lut[i * 3] = a[1][0] + (b[1][0] - a[1][0]) * f;
    lut[i * 3 + 1] = a[1][1] + (b[1][1] - a[1][1]) * f;
    lut[i * 3 + 2] = a[1][2] + (b[1][2] - a[1][2]) * f;
  }
  return lut;
}

export const PALETTE_NAMES = ["TURBO", "JET", "INFERNO", "IRONBOW"] as const;
export type PaletteName = (typeof PALETTE_NAMES)[number];

export const LUTS: Record<PaletteName, Uint8ClampedArray> = {
  TURBO: buildLUT([
    [0.0, [48, 18, 59]],
    [0.13, [70, 107, 227]],
    [0.25, [40, 170, 250]],
    [0.38, [24, 214, 203]],
    [0.5, [90, 228, 127]],
    [0.63, [181, 222, 43]],
    [0.75, [240, 180, 34]],
    [0.88, [250, 110, 12]],
    [1.0, [122, 4, 3]],
  ]),
  JET: buildLUT([
    [0.0, [0, 0, 143]],
    [0.125, [0, 0, 255]],
    [0.375, [0, 255, 255]],
    [0.625, [255, 255, 0]],
    [0.875, [255, 0, 0]],
    [1.0, [128, 0, 0]],
  ]),
  INFERNO: buildLUT([
    [0.0, [0, 0, 4]],
    [0.25, [87, 16, 110]],
    [0.5, [188, 55, 84]],
    [0.75, [249, 142, 9]],
    [1.0, [252, 255, 164]],
  ]),
  IRONBOW: buildLUT([
    [0.0, [0, 0, 0]],
    [0.25, [60, 0, 120]],
    [0.5, [180, 30, 80]],
    [0.75, [250, 140, 20]],
    [1.0, [255, 255, 220]],
  ]),
};
