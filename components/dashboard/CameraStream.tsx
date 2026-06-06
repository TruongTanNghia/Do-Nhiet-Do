"use client";

import { Power, Loader2, VideoOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/types";
import type { CamState } from "@/hooks/useCameraProcessor";
import { PALETTE_NAMES } from "@/lib/vision/palette";

const MODES: { key: ViewMode; label: string }[] = [
  { key: "normal", label: "Thường" },
  { key: "thermal", label: "Nhiệt" },
  { key: "blend", label: "Hòa trộn" },
];

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  camState: CamState;
  error: string | null;
  fps: number;
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  palette: number;
  setPalette: (p: number) => void;
  onStart: () => void;
  onStop: () => void;
}

export function CameraStream({
  videoRef, canvasRef, camState, error, fps,
  mode, setMode, palette, setPalette, onStart, onStop,
}: Props) {
  const on = camState === "on";
  const loading = camState === "loading";

  return (
    <div className="overflow-hidden rounded-2xl border border-line2 bg-bg2">
      {/* thanh điều khiển */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-txtfaint">CAMERA</span>
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            on ? "animate-pulse-dot bg-red" : camState === "error" ? "bg-amber" : "bg-txtfaint",
          )}
        />
        <span className="font-mono text-[11px] text-txtfaint">{fps.toFixed(1)} FPS</span>

        <button
          onClick={on ? onStop : onStart}
          disabled={loading}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
            on ? "bg-red/15 text-red hover:bg-red/25" : "bg-mint/15 text-mint hover:bg-mint/25",
          )}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
          {on ? "Tắt camera" : loading ? "Đang tải..." : "Mở camera"}
        </button>

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
            {PALETTE_NAMES.map((p, i) => (
              <option key={p} value={i}>{p}</option>
            ))}
          </select>
        )}
      </div>

      {/* khung video */}
      <div className="relative aspect-video w-full bg-black">
        {/* video ẩn — chỉ dùng để xử lý, hiển thị qua canvas */}
        <video
          ref={videoRef}
          muted
          playsInline
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
        <canvas ref={canvasRef} className="h-full w-full object-contain" />

        {!on && (
          <div className="absolute inset-0 grid place-items-center bg-bg/85 px-6 text-center">
            <div>
              <div className="mb-2 flex justify-center">
                {camState === "error" ? (
                  <AlertTriangle className="h-8 w-8 text-red" />
                ) : loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-cyan" />
                ) : (
                  <VideoOff className="h-8 w-8 text-txtdim" />
                )}
              </div>
              <p className="text-lg font-semibold text-txt">
                {camState === "error"
                  ? "Không truy cập được camera"
                  : loading
                    ? "Đang tải mô hình AI..."
                    : "Camera đang tắt"}
              </p>
              <p className="mt-1 text-sm text-txtfaint">
                {camState === "error"
                  ? error ?? "Hãy cấp quyền camera cho trang web rồi thử lại."
                  : loading
                    ? "Tải MediaPipe lần đầu (~vài giây)."
                    : 'Bấm "Mở camera" — dùng webcam của chính bạn, xử lý ngay trên trình duyệt.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
