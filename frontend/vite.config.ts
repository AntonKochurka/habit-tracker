import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  root: __dirname,
  envDir: path.resolve(__dirname, ".."),
  cacheDir: "./node_modules/.vite/.",


  server: {
    host: "localhost",
    port: 4200
  },

  resolve: { 
    alias: {
      "@app": path.resolve(__dirname, "src", "apps"),
      "@shared": path.resolve(__dirname, "src", "shared"),
      "@components": path.resolve(__dirname, "src", "shared", "components")
    }
  }
})
