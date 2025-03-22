import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://cecomapi.erickpajares.dev', // URL de la API de caudal
        changeOrigin: true,                          // Cambiar el origen de la solicitud (necesario para algunos servidores)
        secure: false,                               // Usar false si el servidor tiene un certificado SSL no válido
        rewrite: (path) => path.replace(/^\/api/, ''), // Elimina "/api" del path
      },
    },
  },
})
