// Nạp FaceLandmarker (MediaPipe Tasks Vision) — chạy trong trình duyệt (WASM).
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import { CFG, FACE_MODEL_URL, MP_VERSION } from "./config";

let _lm: FaceLandmarker | null = null;
let _loading: Promise<FaceLandmarker> | null = null;

export async function getLandmarker(): Promise<FaceLandmarker> {
  if (_lm) return _lm;
  if (_loading) return _loading;

  _loading = (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(
      `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`,
    );

    const make = (delegate: "GPU" | "CPU") =>
      FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
        runningMode: "VIDEO",
        numFaces: CFG.maxFaces,
      });

    try {
      _lm = await make("GPU");
    } catch {
      _lm = await make("CPU"); // fallback nếu máy không hỗ trợ WebGL
    }
    return _lm;
  })();

  return _loading;
}
