export type Status = "OK" | "WATCH" | "HIGH";

export interface PersonLive {
  id: number;
  temp: number | null;
  risk: number | null;
  redness: number | null;
  status: Status;
  bbox: number[];
}

export type CameraState = "off" | "on" | "error";

export interface LiveState {
  camera_ok: boolean;
  camera_state: CameraState;
  active: boolean;
  fps: number;
  timestamp: number;
  persons: PersonLive[];
  max_risk: number;
  alert_count: number;
  primary: PersonLive | null;
}

export interface Camera {
  id: string;
  name: string;
  rtsp_url: string;
  status: "ONLINE" | "OFFLINE" | "RECONNECTING";
}

export type ViewMode = "normal" | "thermal" | "blend";
