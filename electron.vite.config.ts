import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [
      react(),
      {
        name: 'css-inline',
        enforce: 'post',
        transform(code, id) {
          if (id.endsWith('.css')) {
            return {
              code: code.replace(/@import\s+url\([^)]+\)/g, ''),
              map: null
            }
          }
        }
      }
    ]
  }
})
