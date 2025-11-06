import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true, // needed for outDir action to work
  },
  server: {
    port: 3000,
    proxy: {
      '/test': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
      '/query': 'http://localhost:3001',
      '/api': 'http://localhost:3001',
     }
  }
});
