import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Where the Flag Service lives. Override with VITE_API_PROXY_TARGET in `.env`,
// e.g. to run against a local instance at http://localhost:8001.
const DEFAULT_API_TARGET = 'https://flag-service.onrender.com'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || DEFAULT_API_TARGET
  // GitHub Pages serves project sites from /<repo>/, not the domain root. The
  // deploy workflow sets VITE_BASE_PATH=/FF-UI/; locally it stays at "/".
  const base = env.VITE_BASE_PATH || '/'

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // The UI always calls /api/...; the dev server forwards to the service
        // and strips the prefix, so /api/flags -> <target>/flags. Proxying keeps
        // requests same-origin, which the service needs because it does not send
        // CORS headers.
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // Render's free tier sleeps; allow a cold start to finish.
          timeout: 120_000,
          proxyTimeout: 120_000,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
