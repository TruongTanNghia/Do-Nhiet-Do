"use client";

import { LayoutDashboard, Video, Bell, BarChart3, Settings, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Cameras", icon: Video, active: false },
  { label: "Events", icon: Bell, active: false },
  { label: "Analytics", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings, active: false },
];

export function Sidebar() {
  return (
    <aside className="flex w-[210px] shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-5">
      <div className="mb-7 flex items-center gap-2 px-2">
        <Thermometer className="h-6 w-6 text-cyan" />
        <span className="text-lg font-extrabold tracking-tight text-cyan">FeverGuard</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-cyan/12 font-semibold text-cyan"
                : "text-txtdim hover:bg-surface2 hover:text-txt",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
            {!active && <span className="ml-auto text-[10px] text-txtfaint">soon</span>}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-red/30 bg-red/5 p-3 text-[11px] leading-snug text-txtdim">
        <span className="font-semibold text-red">⚠ Không phải thiết bị y tế.</span> Mọi
        nhiệt độ chỉ là ước lượng (estimated).
      </div>
    </aside>
  );
}
