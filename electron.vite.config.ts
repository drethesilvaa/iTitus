import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, 'shared'),
      },
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'electron/main.ts'),
      },
      rollupOptions: {
        output: { format: 'es' },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: path.resolve(__dirname, 'electron/preload.ts'),
      },
      rollupOptions: {
        output: { format: 'cjs' },
      },
    },
  },
  renderer: {
    root: path.resolve(__dirname, '.'),
    build: {
      outDir: path.resolve(__dirname, 'out/renderer'),
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
        external: [],
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, 'shared'),
      },
    },
  },
})
