import { API_BASE } from "./config";
import type { Camera } from "@/types";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

export const api = {
  health: () => getJSON<{ status: string; camera_ok: boolean; fps: number }>("/api/health"),
  cameras: () => getJSON<Camera[]>("/api/cameras"),
  videoUrl: (mode: string, palette: number) =>
    `${API_BASE}/video?mode=${mode}&palette=${palette}`,
};
