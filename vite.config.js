import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Quill is only reached via a lazy import(); force pre-bundling so its
    // CommonJS dependency (quill-delta) gets proper ESM interop in the dev
    // server. Without this, Vite serves Quill raw and the lazy import rejects
    // with "does not provide an export named 'default'".
    include: ['quill'],
  },
})
