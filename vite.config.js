import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['recharts'],
  },
  server: {
    proxy: {
      // Use 127.0.0.1 (not "localhost") to match the backend's IPv4 bind.
      // On Windows "localhost" may resolve to ::1 (IPv6) first, which the
      // backend (bound to 127.0.0.1) refuses → proxy 500 with empty body.
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
