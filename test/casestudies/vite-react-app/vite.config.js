import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: 'inline'
    },
  plugins: [reactRefresh()],
    server: { cors: true }
})
