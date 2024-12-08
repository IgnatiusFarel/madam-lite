import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Gunakan '0.0.0.0' agar aplikasi bisa diakses dari jaringan eksternal
    port: 5173, // Port yang akan digunakan
  },
})
