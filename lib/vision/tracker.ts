import { CFG } from "./config";
import type { Point } from "./types";

export interface Detection {
  centroid: Point;
  redness: number;
  temp: number;
  risk: number;
}

export class Track {
  id: number;
  centroid: Point;
  redness: number;
  temp: number;
  risk: number;
  missing = 0;
  lastAlert = 0;

  constructor(id: number, d: Detection) {
    this.id = id;
    this.centroid = d.centroid;
    this.redness = d.redness;
    this.temp = d.temp;
    this.risk = d.risk;
  }
}

/** Centroid tracker + làm mượt EMA (port từ backend tracker.py). */
export class CentroidTracker {
  private nextId = 1;
  tracks = new Map<number, Track>();

  private ema(old: number, next: number) {
    const a = CFG.emaAlpha;
    return a * next + (1 - a) * old;
  }

  update(detections: Detection[]): Track[] {
    const used = new Set<number>();
    const assigned = new Map<number, number>();

    for (const [id, tr] of this.tracks) {
      let best = -1;
      let bestD = CFG.matchDistance;
      detections.forEach((d, i) => {
        if (used.has(i)) return;
        const dist = Math.hypot(tr.centroid[0] - d.centroid[0], tr.centroid[1] - d.centroid[1]);
        if (dist < bestD) {
          bestD = dist;
          best = i;
        }
      });
      if (best >= 0) {
        used.add(best);
        assigned.set(id, best);
      }
    }

    for (const [id, tr] of [...this.tracks]) {
      const di = assigned.get(id);
      if (di !== undefined) {
        const d = detections[di];
        tr.centroid = d.centroid;
        tr.redness = this.ema(tr.redness, d.redness);
        tr.temp = this.ema(tr.temp, d.temp);
        tr.risk = this.ema(tr.risk, d.risk);
        tr.missing = 0;
      } else {
        tr.missing += 1;
        if (tr.missing > CFG.maxMissing) this.tracks.delete(id);
      }
    }

    detections.forEach((d, i) => {
      if (used.has(i)) return;
      const tr = new Track(this.nextId, d);
      this.tracks.set(this.nextId, tr);
      this.nextId += 1;
    });

    return [...this.tracks.values()].filter((t) => t.missing === 0);
  }
}
