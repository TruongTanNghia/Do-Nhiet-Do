import type { Status } from "@/types";
import { CFG, clamp } from "./config";
import type { RGB } from "./types";

const rg = (c: RGB) => c.r / (c.r + c.g + c.b + 1e-6);

export function rednessIndex(m: { forehead: RGB; cheekL: RGB; cheekR: RGB }): number {
  const ratio = 0.5 * rg(m.forehead) + 0.25 * rg(m.cheekL) + 0.25 * rg(m.cheekR);
  const v = ((ratio - CFG.rgLow) / (CFG.rgHigh - CFG.rgLow)) * 100;
  return clamp(v, 0, 100);
}

export function estimateTemperature(redness: number): number {
  return CFG.baseTemp + (redness / 100) * CFG.tempSpan + CFG.tempOffset;
}

export function estimateRisk(temp: number): number {
  const v = ((temp - CFG.riskTempLow) / (CFG.riskTempHigh - CFG.riskTempLow)) * 100;
  return clamp(v, 0, 100);
}

export function classify(risk: number, temp: number): Status {
  if (risk >= CFG.riskThreshold || temp >= CFG.tempThreshold) return "HIGH";
  if (risk >= CFG.watchRisk) return "WATCH";
  return "OK";
}
