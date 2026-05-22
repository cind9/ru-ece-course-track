import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/soc-api": {
        target: "https://classes.rutgers.edu",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/soc-api/, "/soc/api"),
      },
    },
  },
})
