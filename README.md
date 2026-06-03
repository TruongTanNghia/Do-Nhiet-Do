# FeverGuard — Frontend (Next.js 16)

Dashboard realtime cho **AI Fever Risk Detection System**, dựng theo mockup trong
tài liệu kế hoạch: sidebar + live stream (Normal/Thermal/Blend) + 4 thẻ vitals +
bảng detections + popup cảnh báo.

> ⚠️ **KHÔNG phải thiết bị y tế.** Nhiệt độ chỉ là ước lượng (estimated only).

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react · Recharts.

## Chạy

Cần **backend chạy trước** ở `http://localhost:8000` (xem `../backend/README.md`).

```powershell
cd frontend
npm install        # lần đầu
npm run dev        # http://localhost:3000
```

Đổi địa chỉ backend (nếu khác) bằng biến môi trường:

```powershell
$env:NEXT_PUBLIC_API_BASE = "http://localhost:8000"; npm run dev
```

## Cấu trúc

```
app/
  layout.tsx            Layout gốc + Sidebar
  page.tsx              Trang Dashboard (client, dùng WebSocket)
  globals.css           Tailwind v4 + bảng màu theo mockup
components/
  layout/Sidebar.tsx
  dashboard/CameraStream.tsx   <img> MJPEG + nút Normal/Thermal/Blend + palette
  dashboard/VitalCard.tsx      Thẻ HR / RR / Fever Risk / Est. Temp
  dashboard/DetectionTable.tsx Bảng người đang phát hiện
  dashboard/AlertPopup.tsx     Popup + chuông Web Audio khi có HIGH
  ui/                          card, badge primitives
hooks/useLiveState.ts          WebSocket /ws/live (auto-reconnect)
lib/                           api client, config, utils
types/                         kiểu TypeScript dùng chung
```

## Ghi chú
- **Heart Rate / Resp Rate** hiển thị `—` (rPPG là Pha 3, chưa triển khai). Chỉ
  **Fever Risk** và **Est. Temp** là dữ liệu live thật từ pipeline.
- Live video dùng **MJPEG** (`<img src=".../video">`) đã được backend vẽ sẵn box +
  nhiệt; dữ liệu số (vitals/detections/alert) đến qua **WebSocket**.
