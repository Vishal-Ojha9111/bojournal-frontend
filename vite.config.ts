import { defineConfig, loadEnv } from 'vite'
import type {ConfigEnv} from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }:ConfigEnv) => {
  const env = loadEnv(mode, process.cwd());
  console.log(env)
  process.env = {...process.env, ...env};

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: env.VITE_SERVER_URL,
          changeOrigin: true,
          secure: false
        }
      }
    }
  });
}