import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  esbuild: {
    // Strip development chatter from the production bundle but keep console.warn
    // and console.error — those are real diagnostics, and the test suite asserts
    // on a clean console, which a blanket drop would silently defeat.
    pure: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
  },
  build: {
    // Every byte here is served from Hostinger shared hosting, so the priority is
    // a small critical path over a small file count.
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Rollup's automatic splitting already keeps three.js out of the critical
        // path now that every importer of it is a dynamic import, and it does a
        // better job than hand-written buckets did: forcing a "three" chunk made
        // drei's transitive deps land in a vendor chunk that statically imported
        // it, which dragged all 880 kB back into the entry graph.
        //
        // React is the one safe exception. It is needed unconditionally, so
        // splitting it costs nothing on first load and keeps ~200 kB cached
        // across deploys instead of rehashing with every app-code change.
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
        },
        // Group build output by type so the .htaccess cache rules can target
        // hashed assets by directory.
        assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
}))
