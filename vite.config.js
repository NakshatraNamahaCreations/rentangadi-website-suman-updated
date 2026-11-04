import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Local backend. The enquiry list reports how far each enquiry got
        // (pipelineStatus), which the hosted copy does not have yet - so the
        // site reads the one running here. Swap the blocks to point elsewhere.
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,

        // Hosted backend (Render).
        // target: 'https://rentangadi-backend-suman.onrender.com',
        // changeOrigin: true,
        // secure: true,

        // target: 'https://api.rentangadi.in',
        // changeOrigin: true,
        // secure: true,
      },
    },
  },
})
