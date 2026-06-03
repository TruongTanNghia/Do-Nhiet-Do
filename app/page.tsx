"use client";

import { useLiveState } from "@/hooks/useLiveState";
import { CameraStream } from "@/components/dashboard/CameraStream";
import { VitalCard } from "@/components/dashboard/VitalCard";
import { DetectionTable } from "@/components/dashboard/DetectionTable";
import { AlertPopup } from "@/components/dashboard/AlertPopup";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { state, connected } = useLiveState();
  const primary = state?.primary ?? null;
  const fps = state?.fps ?? 0;
  const hasHigh = (state?.persons ?? []).some((p) => p.status === "HIGH");

  const riskAccent = !primary?.risk
    ? "text-txt"
    : primary.risk >= 80
      ? "text-red"
      : primary.risk >= 50
        ? "text-amber"
        : "text-mint";

  return (
    <div className="px-7 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-txtdim">
            Theo dõi nguy cơ sốt theo thời gian thực · ước lượng từ camera RGB
          </p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 rounded-full border border-line2 bg-surface px-3 py-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                connected ? "animate-pulse-dot bg-mint" : "bg-red",
              )}
            />
            <span className="font-mono text-xs text-txtdim">
              {connected ? "REALTIME CONNECTED" : "DISCONNECTED"}
            </span>
          </div>
          <span className="font-mono text-[10px] text-txtfaint">{api.base}</span>
        </div>
      </div>

      {/* Cảnh báo dải ngang */}
      {hasHigh && (
        <div className="mb-5 rounded-xl border border-red/40 bg-red/8 px-5 py-3 text-sm">
          <span className="font-semibold text-red">⚠ ALERT</span>{" "}
          <span className="text-txtdim">
            Có người vượt ngưỡng nguy cơ — kiểm tra thủ công bằng nhiệt kế.
          </span>
        </div>
      )}

      {/* Lưới chính */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-5">
          <CameraStream cameraState={state?.camera_state} fps={fps} />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <VitalCard label="Heart Rate" value="—" unit="bpm" hint="rPPG · Pha 3" />
            <VitalCard label="Resp Rate" value="—" unit="br/min" hint="Pha 3" />
            <VitalCard
              label="Fever Risk"
              value={primary?.risk != null ? `${primary.risk}%` : "—"}
              accent={riskAccent}
              hint={primary ? `ID ${primary.id}` : "chưa có người"}
            />
            <VitalCard
              label="Est. Temp"
              value={primary?.temp != null ? `${primary.temp.toFixed(1)}°` : "—"}
              unit="C"
              accent="text-amber"
              hint="estimated only"
            />
          </div>
        </div>

        <DetectionTable persons={state?.persons ?? []} />
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-center font-mono text-[11px] text-txtfaint">
        AI FEVER RISK DETECTION · Research &amp; Early-Warning only —{" "}
        <span className="text-red">KHÔNG phải thiết bị y tế</span>
      </p>

      <AlertPopup state={state} />
    </div>
  );
}
