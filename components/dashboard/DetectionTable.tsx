import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import type { PersonLive } from "@/types";

export function DetectionTable({ persons }: { persons: PersonLive[] }) {
  return (
    <Card className="flex h-full flex-col p-0">
      <div className="border-b border-line px-5 py-4">
        <CardTitle>Current Detections</CardTitle>
        <p className="mt-0.5 text-xs text-txtfaint">{persons.length} người đang theo dõi</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {persons.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-txtfaint">
            Chưa phát hiện khuôn mặt nào.
          </p>
        ) : (
          <ul className="divide-y divide-line/60">
            {persons.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="font-mono text-sm text-txt">ID {p.id}</span>
                <span className="font-mono text-xs text-txtfaint">
                  {p.temp?.toFixed(1) ?? "--"}°C · risk {p.risk ?? "--"}%
                </span>
                <span className="ml-auto">
                  <StatusBadge status={p.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
