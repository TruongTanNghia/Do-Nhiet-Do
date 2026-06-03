import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function VitalCard({
  label,
  value,
  unit,
  accent = "text-txt",
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="font-mono text-[10px] uppercase tracking-wider text-txtfaint">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn("text-3xl font-extrabold leading-none", accent)}>{value}</span>
        {unit && <span className="text-xs text-txtfaint">{unit}</span>}
      </div>
      {hint && <div className="mt-1.5 text-[11px] text-txtfaint">{hint}</div>}
    </Card>
  );
}
