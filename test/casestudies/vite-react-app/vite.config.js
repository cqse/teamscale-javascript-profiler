import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: 'inline'
    },
  plugins: [],
    server: { cors: true }
})
