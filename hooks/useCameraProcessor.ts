"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import type { PersonLive, ViewMode } from "@/types";
import { CFG, clamp } from "@/lib/vision/config";
import { getLandmarker } from "@/lib/vision/landmarker";
import { extractFaces } from "@/lib/vision/roi";
import { classify, estimateRisk, estimateTemperature, rednessIndex } from "@/lib/vision/estimation";
import { CentroidTracker } from "@/lib/vision/tracker";
import { renderThermal, type Glow } from "@/lib/vision/thermal";
import { PALETTE_NAMES } from "@/lib/vision/palette";
import { drawBanner, drawColorbar, drawFace, drawHud, drawSpot } from "@/lib/vision/render";
import type { RenderPerson } from "@/lib/vision/types";

export type CamState = "off" | "loading" | "on" | "error";

export interface ProcessorState {
  persons: PersonLive[];
  primary: PersonLive | null;
  maxRisk: number;
  alertCount: number;
  fps: number;
}

const EMPTY: ProcessorState = { persons: [], primary: null, maxRisk: 0, alertCount: 0, fps: 0 };

export function useCameraProcessor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [camState, setCamState] = useState<CamState>("off");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("normal");
  const [palette, setPalette] = useState(0);
  const [state, setState] = useState<ProcessorState>(EMPTY);

  const lmRef = useRef<FaceLandmarker | null>(null);
  const trackerRef = useRef(new CentroidTracker());
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const thermalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fpsRef = useRef(0);
  const prevRef = useRef(0);
  const lastStateRef = useRef(0);
  const alertCountRef = useRef(0);

  const modeRef = useRef(mode);
  const paletteRef = useRef(palette);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { paletteRef.current = palette; }, [palette]);

  const process = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const lm = lmRef.current;
    if (!video || !canvas || !lm || video.readyState < 2 || video.videoWidth === 0) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // canvas lấy mẫu ở độ phân giải video
    let sc = sampleCanvasRef.current;
    if (!sc) { sc = document.createElement("canvas"); sampleCanvasRef.current = sc; }
    if (sc.width !== vw || sc.height !== vh) { sc.width = vw; sc.height = vh; }
    const sctx = sc.getContext("2d", { willReadFrequently: true })!;
    sctx.drawImage(video, 0, 0, vw, vh);

    // phát hiện landmark
    const res = lm.detectForVideo(video, performance.now());
    const faces = (res.faceLandmarks ?? []) as { x: number; y: number }[][];
    const samples = extractFaces(faces, vw, vh, sctx);

    const detections = samples.map((sm) => {
      const redness = rednessIndex(sm.meanColor);
      const temp = estimateTemperature(redness);
      const risk = estimateRisk(temp);
      return { centroid: sm.centroid, redness, temp, risk };
    });

    const tracks = trackerRef.current.update(detections);
    const now = performance.now();
    const persons: RenderPerson[] = [];
    for (const tr of tracks) {
      let best = null as (typeof samples)[number] | null;
      let bd = Infinity;
      for (const sm of samples) {
        const d = (sm.centroid[0] - tr.centroid[0]) ** 2 + (sm.centroid[1] - tr.centroid[1]) ** 2;
        if (d < bd) { bd = d; best = sm; }
      }
      if (!best) continue;
      const status = classify(tr.risk, tr.temp);
      persons.push({
        id: tr.id, temp: tr.temp, risk: tr.risk, status,
        bbox: best.bbox, centroid: best.centroid, rois: best.rois,
      });
      if (status === "HIGH" && now - tr.lastAlert > CFG.alertCooldownMs) {
        tr.lastAlert = now;
        alertCountRef.current += 1;
      }
    }

    // ----- vẽ -----
    const ctx = canvas.getContext("2d")!;
    if (canvas.width !== vw || canvas.height !== vh) { canvas.width = vw; canvas.height = vh; }
    const curMode = modeRef.current;
    const palName = PALETTE_NAMES[paletteRef.current % PALETTE_NAMES.length];
    const thermalOn = curMode !== "normal";

    if (!thermalOn) {
      ctx.drawImage(video, 0, 0, vw, vh);
    } else {
      const tw = CFG.thermalWidth;
      const th = Math.round((tw * vh) / vw);
      let tc = thermalCanvasRef.current;
      if (!tc) { tc = document.createElement("canvas"); thermalCanvasRef.current = tc; }
      if (tc.width !== tw || tc.height !== th) { tc.width = tw; tc.height = th; }
      const tctx = tc.getContext("2d", { willReadFrequently: true })!;
      tctx.drawImage(video, 0, 0, tw, th);
      const srcImg = tctx.getImageData(0, 0, tw, th);
      const sx = tw / vw;
      const sy = th / vh;
      const glows: Glow[] = persons.map((p) => ({
        cx: p.centroid[0] * sx,
        cy: p.centroid[1] * sy,
        fw: (p.bbox[2] - p.bbox[0]) * sx,
        fh: (p.bbox[3] - p.bbox[1]) * sy,
        heat: clamp((p.temp - CFG.baseTemp) / CFG.tempSpan, 0, 1),
      }));
      tctx.putImageData(renderThermal(srcImg, glows, palName), 0, 0);
      ctx.imageSmoothingEnabled = true;
      if (curMode === "blend") {
        ctx.drawImage(video, 0, 0, vw, vh);
        ctx.globalAlpha = 0.6;
        ctx.drawImage(tc, 0, 0, vw, vh);
        ctx.globalAlpha = 1;
      } else {
        ctx.drawImage(tc, 0, 0, vw, vh);
      }
    }

    for (const p of persons) {
      drawFace(ctx, p, !thermalOn);
      if (thermalOn) drawSpot(ctx, p);
    }
    if (thermalOn) drawColorbar(ctx, vw, vh, palName, CFG.baseTemp, CFG.baseTemp + CFG.tempSpan);
    drawBanner(ctx, vw);

    const dt = now - prevRef.current;
    prevRef.current = now;
    if (dt > 0) fpsRef.current = 0.9 * fpsRef.current + 0.1 * (1000 / dt);
    drawHud(ctx, vw, vh, fpsRef.current, persons.length, curMode);

    // cập nhật React state (throttle ~150ms)
    if (now - lastStateRef.current > 150) {
      lastStateRef.current = now;
      const plist: PersonLive[] = persons.map((p) => ({
        id: p.id,
        temp: Math.round(p.temp * 10) / 10,
        risk: Math.round(p.risk),
        redness: null,
        status: p.status,
        bbox: p.bbox as unknown as number[],
      }));
      let primary: PersonLive | null = null;
      for (const p of plist) if (!primary || (p.risk ?? 0) > (primary.risk ?? 0)) primary = p;
      setState({
        persons: plist,
        primary,
        maxRisk: primary?.risk ?? 0,
        alertCount: alertCountRef.current,
        fps: fpsRef.current,
      });
    }
  }, []);

  const loop = useCallback(() => {
    if (!runningRef.current) return;
    try {
      process();
    } catch (e) {
      console.error("process error:", e);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [process]);

  const start = useCallback(async () => {
    if (camState === "on" || camState === "loading") return;
    setError(null);
    setCamState("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      lmRef.current = await getLandmarker();
      runningRef.current = true;
      prevRef.current = performance.now();
      setCamState("on");
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : String(e));
      setCamState("error");
    }
  }, [camState, loop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (video) video.srcObject = null;
    trackerRef.current = new CentroidTracker();
    setCamState("off");
    setState((s) => ({ ...EMPTY, alertCount: s.alertCount }));
  }, []);

  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, canvasRef, camState, error, mode, setMode, palette, setPalette, start, stop, state };
}
