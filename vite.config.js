import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        persona: resolve(__dirname, 'persona.html'),
        records: resolve(__dirname, 'records.html'),
        record_detail: resolve(__dirname, 'record_detail.html'),
        problem_admin: resolve(__dirname, 'problem_admin.html')
      }
    }
  }
})
