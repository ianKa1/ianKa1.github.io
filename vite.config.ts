import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages deployment (username.github.io)
  // If deploying to a repo like github.com/user/repo, use: base: '/repo/'
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
