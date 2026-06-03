"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/types";

const MODES: { key: ViewMode; label: string }[] = [
  { key: "normal", label: "Thường" },
  { key: "thermal", label: "Nhiệt" },
  { key: "blend", label: "Hòa trộn" },
];
const PALETTES = ["TURBO", "JET", "INFERNO", "IRONBOW"];

export function CameraStream({ cameraOk, fps }: { cameraOk: boolean; fps: number }) {
  const [mode, setMode] = useState<ViewMode>("normal");
  const [palette, setPalette] = useState(0);

  return (
    <div className="overflow-hidden rounded-2xl border border-line2 bg-bg2">
      {/* thanh điều khiển */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-txtfaint">
          CAMERA 01 · LIVE
        </span>
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            cameraOk ? "animate-pulse-dot bg-red" : "bg-txtfaint",
          )}
        />
        <span className="font-mono text-[11px] text-txtfaint">{fps.toFixed(1)} FPS</span>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-line2 bg-bg p-0.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs transition-colors",
                mode === m.key ? "bg-cyan/15 text-cyan" : "text-txtdim hover:text-txt",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode !== "normal" && (
          <select
            value={palette}
            onChange={(e) => setPalette(Number(e.target.value))}
            className="rounded-md border border-line2 bg-bg px-2 py-1 font-mono text-xs text-txtdim"
          >
            {PALETTES.map((p, i) => (
              <option key={p} value={i}>
                {p}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* khung video MJPEG */}
      <div className="relative aspect-video w-full bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${mode}-${palette}`}
          src={api.videoUrl(mode, palette)}
          alt="Live camera"
          className="h-full w-full object-contain"
        />
        {!cameraOk && (
          <div className="absolute inset-0 grid place-items-center bg-bg/80">
            <div className="text-center">
              <p className="text-lg font-semibold text-red">Camera OFFLINE</p>
              <p className="mt-1 text-sm text-txtdim">
                Kiểm tra webcam hoặc biến môi trường CAMERA_INDEX
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
