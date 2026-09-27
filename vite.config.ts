import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base + flat asset output: makes the build work unmodified
  // whether it's served at a domain root or under a GitHub Pages project
  // subpath (username.github.io/reponame/).
  base: "./",
  build: {
    assetsDir: "",
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
})
