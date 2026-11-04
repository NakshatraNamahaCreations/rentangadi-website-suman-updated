import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Hosted backend (Render). Swap the blocks to point elsewhere.
        target: 'https://rentangadi-backend-suman.onrender.com',
        changeOrigin: true,
        secure: true,

        // target: 'http://localhost:8000',
        // changeOrigin: true,
        // secure: false,

        // target: 'https://api.rentangadi.in',
        // changeOrigin: true,
        // secure: true,
      },
    },
  },
})
