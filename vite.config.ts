

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/tasks': {
        target: 'http://localhost:30080',
        changeOrigin: true,
      }
    }
  }
})