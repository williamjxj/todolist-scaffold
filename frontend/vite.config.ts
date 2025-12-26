import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  server: {
    port: 5173,
    // Proxy is only used in development (npm run dev)
    // In production, set VITE_API_URL environment variable to the backend URL
    // For local dev: VITE_API_URL=/api (uses this proxy)
    // For production: VITE_API_URL=https://todolist-scaffold.onrender.com/api
    proxy: {
      '/api': {
        target: 'http://localhost:8173',
        changeOrigin: true,
      },
    },
  },
})
