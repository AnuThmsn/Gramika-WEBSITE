import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'recharts',
      'react-bootstrap-icons',
      'jspdf',
      'react-bootstrap',
      'redux',
      'redux-thunk',
      'internmap'
    ]
  }
  ,
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})