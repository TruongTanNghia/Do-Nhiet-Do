"use client";

import { useEffect, useRef, useState } from "react";
import { WS_BASE } from "@/lib/config";
import type { LiveState } from "@/types";

/** Kết nối WebSocket /ws/live, tự reconnect, trả về state realtime. */
export function useLiveState() {
  const [state, setState] = useState<LiveState | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let closed = false;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE}/ws/live`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onmessage = (ev) => {
        try {
          setState(JSON.parse(ev.data) as LiveState);
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retry = setTimeout(connect, 1500);
      };
      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(retry);
      wsRef.current?.close();
    };
  }, []);

  return { state, connected };
}
