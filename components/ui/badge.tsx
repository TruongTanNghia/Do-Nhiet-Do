import { cn } from "@/lib/utils";
import type { Status } from "@/types";

const STYLES: Record<Status, string> = {
  OK: "bg-mint/15 text-mint border-mint/30",
  WATCH: "bg-amber/15 text-amber border-amber/30",
  HIGH: "bg-red/15 text-red border-red/40",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide",
        STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
