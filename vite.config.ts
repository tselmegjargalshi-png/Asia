import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js and the R3F reconciler are large by nature; they load behind the intro.
    chunkSizeWarningLimit: 700,
  },
})
