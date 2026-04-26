import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('framer-motion')) return 'motion';
          }
        }
      }
    },
    chunkSizeWarningLimit: 700,
    sourcemap: false,
  },
  server: {
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true }
    }
  }
})
