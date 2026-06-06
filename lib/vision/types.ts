import type { Status } from "@/types";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type BBox = [number, number, number, number]; // x1,y1,x2,y2
export type Point = [number, number];

export interface FaceSample {
  bbox: BBox;
  centroid: Point;
  rois: { forehead: Rect; cheekL: Rect; cheekR: Rect };
  meanColor: { forehead: RGB; cheekL: RGB; cheekR: RGB };
}

export interface RenderPerson {
  id: number;
  temp: number;
  risk: number;
  status: Status;
  bbox: BBox;
  centroid: Point;
  rois: { forehead: Rect; cheekL: Rect; cheekR: Rect };
}
