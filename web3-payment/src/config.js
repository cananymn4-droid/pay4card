export const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:4000"
    : window.location.origin);

export const SOCKET_OPTIONS = {
  transports: ["websocket", "polling"],
};
