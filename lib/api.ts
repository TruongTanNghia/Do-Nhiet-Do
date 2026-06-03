import { API_BASE } from "./config";
import type { Camera } from "@/types";

// Header này giúp bỏ trang cảnh báo của ngrok cho các request fetch.
const COMMON_HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: COMMON_HEADERS,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

async function postJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: COMMON_HEADERS,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

export const api = {
  base: API_BASE,
  health: () => getJSON<{ status: string; camera_ok: boolean; fps: number }>("/api/health"),
  cameras: () => getJSON<Camera[]>("/api/cameras"),
  startCamera: () => postJSON<{ active: boolean; camera_state: string }>("/api/cameras/start"),
  stopCamera: () => postJSON<{ active: boolean; camera_state: string }>("/api/cameras/stop"),
  // MJPEG dùng trong <img> nên không gắn được header; thêm query để tránh cache.
  videoUrl: (mode: string, palette: number) =>
    `${API_BASE}/video?mode=${mode}&palette=${palette}`,
};
