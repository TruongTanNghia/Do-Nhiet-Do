// Bỏ dấu "/" thừa ở cuối để tránh tạo URL kiểu "https://x//api/...".
const raw = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export const API_BASE = raw.replace(/\/+$/, "");

export const WS_BASE = API_BASE.replace(/^http/, "ws");
