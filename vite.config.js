import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base '/' keeps asset URLs absolute, which is required for client-side
// routing (BrowserRouter) and works both on static hosts that rewrite to
// index.html and inside the Capacitor Android WebView.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
  },
});
