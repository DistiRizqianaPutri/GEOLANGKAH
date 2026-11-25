import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Logika murni (geometry.js, logQueue.js) dites di lingkungan Node.
    environment: 'node',
  },
})
