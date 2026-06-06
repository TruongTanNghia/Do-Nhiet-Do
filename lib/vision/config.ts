// Cấu hình + hằng số cho pipeline CV chạy trong trình duyệt.
// LƯU Ý: redness -> nhiệt độ là HEURISTIC, KHÔNG phải y tế (estimated only).

export const CFG = {
  maxFaces: 5,

  // redness -> nhiệt độ
  rgLow: 0.34,
  rgHigh: 0.46,
  baseTemp: 36.4,
  tempSpan: 2.2,
  tempOffset: 0,

  // risk
  riskTempLow: 37.0,
  riskTempHigh: 38.3,
  riskThreshold: 80,
  tempThreshold: 37.8,
  watchRisk: 50,

  // smoothing / tracking
  emaAlpha: 0.2,
  matchDistance: 90,
  maxMissing: 15,

  // alert
  alertCooldownMs: 10000,

  // thermal: độ phân giải buffer (nhỏ cho mượt, upscale sẽ tạo blur đẹp)
  thermalWidth: 480,
};

// Chỉ số landmark (FaceLandmarker dùng cùng topology với FaceMesh).
export const IDX = {
  foreheadTop: 10,
  glabella: 9,
  browL: 105,
  browR: 334,
  faceL: 234,
  faceR: 454,
  cheekL: 50,
  cheekR: 280,
};

export const MP_VERSION = "0.10.35";
export const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
