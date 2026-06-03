"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { LiveState } from "@/types";

/** Phát chuông + popup khi alert_count tăng (có cảnh báo HIGH mới). M11. */
export function AlertPopup({ state }: { state: LiveState | null }) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<{ id: number; temp: number | null; risk: number | null } | null>(null);
  const lastCount = useRef<number>(-1);

  useEffect(() => {
    if (!state) return;
    if (lastCount.current === -1) {
      lastCount.current = state.alert_count; // bỏ qua lần đầu
      return;
    }
    if (state.alert_count > lastCount.current) {
      lastCount.current = state.alert_count;
      const hi = state.persons.find((p) => p.status === "HIGH") ?? state.primary;
      setInfo(hi ? { id: hi.id, temp: hi.temp, risk: hi.risk } : null);
      setOpen(true);
      beep();
      const t = setTimeout(() => setOpen(false), 6000);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (!open || !info) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px]">
      <div className="rounded-xl border border-red/50 bg-surface p-4 shadow-2xl shadow-red/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red" />
          <div className="flex-1">
            <p className="font-semibold text-red">Cảnh báo nguy cơ sốt cao</p>
            <p className="mt-1 text-sm text-txtdim">
              ID {info.id} · nhiệt độ ước lượng{" "}
              <b className="text-amber">{info.temp?.toFixed(1) ?? "--"}°C</b> · risk{" "}
              <b className="text-red">{info.risk ?? "--"}%</b>
            </p>
            <p className="mt-1 text-[11px] text-txtfaint">
              Snapshot đã lưu — vui lòng kiểm tra thủ công bằng nhiệt kế.
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="text-txtfaint hover:text-txt">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.25;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch {
    /* trình duyệt chặn audio cho tới khi có tương tác */
  }
}
