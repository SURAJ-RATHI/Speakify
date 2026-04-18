import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Use default minifier (Esbuild - built-in)
    minify: 'esbuild',
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for dependencies
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // React icons in separate chunk (large library)
          'icons': [
            'react-icons/fa',
          ],
        },
      },
    },
    // Optimize chunks
    chunkSizeWarningLimit: 600,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-icons/fa',
    ],
  },
});
