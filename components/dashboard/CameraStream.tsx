"use client";

import { useState } from "react";
import { Power, Loader2, VideoOff, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CameraState, ViewMode } from "@/types";

const MODES: { key: ViewMode; label: string }[] = [
  { key: "normal", label: "Thường" },
  { key: "thermal", label: "Nhiệt" },
  { key: "blend", label: "Hòa trộn" },
];
const PALETTES = ["TURBO", "JET", "INFERNO", "IRONBOW"];

export function CameraStream({
  cameraState,
  fps,
}: {
  cameraState: CameraState | undefined;
  fps: number;
}) {
  const [mode, setMode] = useState<ViewMode>("normal");
  const [palette, setPalette] = useState(0);
  const [busy, setBusy] = useState(false);
  const [streamError, setStreamError] = useState(false);

  const on = cameraState === "on";
  const error = cameraState === "error";

  async function toggle() {
    setBusy(true);
    try {
      if (on) await api.stopCamera();
      else await api.startCamera();
    } catch (e) {
      console.error("Không gọi được API camera:", e);
      alert(
        "Không kết nối được backend.\n\nKiểm tra:\n" +
          "• Backend + ngrok đang chạy?\n" +
          "• NEXT_PUBLIC_API_BASE đã đặt đúng và Redeploy?\n\n" +
          "API: " +
          api.base,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line2 bg-bg2">
      {/* thanh điều khiển */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-txtfaint">
          CAMERA 01
        </span>
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            on ? "animate-pulse-dot bg-red" : error ? "bg-amber" : "bg-txtfaint",
          )}
        />
        <span className="font-mono text-[11px] text-txtfaint">{fps.toFixed(1)} FPS</span>

        {/* Nút bật/tắt camera */}
        <button
          onClick={toggle}
          disabled={busy}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
            on
              ? "bg-red/15 text-red hover:bg-red/25"
              : "bg-mint/15 text-mint hover:bg-mint/25",
          )}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Power className="h-3.5 w-3.5" />
          )}
          {on ? "Tắt camera" : "Mở camera"}
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
          onError={() => setStreamError(true)}
          onLoad={() => setStreamError(false)}
        />

        {/* Overlay theo trạng thái */}
        {streamError ? (
          <Overlay icon={<AlertTriangle className="h-8 w-8 text-red" />} title="Không tải được luồng video">
            Kiểm tra ngrok/redeploy. Backend: <span className="text-txtdim">{api.base}</span>
          </Overlay>
        ) : !on && cameraState !== undefined ? (
          <Overlay
            icon={<VideoOff className="h-8 w-8 text-txtdim" />}
            title={error ? "Không mở được camera" : "Camera đang tắt"}
          >
            {error
              ? "Webcam bận hoặc sai CAMERA_INDEX. Thử lại sau khi đóng app khác."
              : 'Bấm "Mở camera" để bắt đầu phát hiện.'}
          </Overlay>
        ) : null}
      </div>
    </div>
  );
}

function Overlay({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg/85 px-6 text-center">
      <div>
        <div className="mb-2 flex justify-center">{icon}</div>
        <p className="text-lg font-semibold text-txt">{title}</p>
        <p className="mt-1 text-sm text-txtfaint">{children}</p>
      </div>
    </div>
  );
}
