import path from "node:path"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Proxy API + backend-served static images so the frontend talks same-origin.
    // This eliminates the CORS / cross-origin cookie issues that broke the
    // automatic access-token refresh flow (HttpOnly cookies are same-site now).
    proxy: {
      "/api": { target: "http://localhost:5289", changeOrigin: true },
      "/categories": { target: "http://localhost:5289", changeOrigin: true },
      "/dishes": { target: "http://localhost:5289", changeOrigin: true },
      // SignalR hub — ws: true bắt buộc để WebSocket handshake đi qua proxy ở dev
      "/hubs": { target: "http://localhost:5289", changeOrigin: true, ws: true },
    },
  },
})