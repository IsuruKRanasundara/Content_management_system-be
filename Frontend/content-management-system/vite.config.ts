import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Extract API URL from environment, fallback to docker default
  const apiUrl = env.VITE_API_URL || 'http://localhost:5000/api'
  const apiTarget = apiUrl.replace('/api', '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // Proxy API requests to the backend
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
        // Proxy upload requests
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    // Define global constants that can be used in the app
    define: {
      __API_URL__: JSON.stringify(apiUrl),
    },
  }
})

