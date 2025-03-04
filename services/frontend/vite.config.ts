import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:3000',
      '/ws': {
        target: 'ws://localhost:4000',
        ws: true,
      }
    }
  }
})
