import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    port: 5176,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 根据不同编译方式设置不同的 base 路径
  // - 开发环境: '/' (本地开发服务器)
  // - Electron 应用: './' (相对路径，用于本地文件系统)
  // - GitHub Pages: '/toolboxs/' (子路径部署)
  // - 其他生产环境: '/' (根路径部署)
  base: (() => {
    if (process.env.ELECTRON === 'true') {
      return './' // Electron 应用使用相对路径
    }
    if (process.env.NODE_ENV === 'production') {
      // 生产环境根据部署目标设置不同前缀
      if (process.env.DEPLOY_TARGET === 'github-pages') {
        return '/toolboxs/' // GitHub Pages 子路径
      }
      return '/' // 其他生产环境使用根路径
    }
    return '/' // 开发环境默认根路径
  })(),
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // 提高警告阈值到 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库分离
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将 Element Plus 分离
          'element-plus': ['element-plus'],
          // 将工具库分离
          'utils': ['crypto-js', 'qrcode', 'jsqr'],
          // 将其他大型依赖分离
          'vendor': ['@element-plus/icons-vue']
        }
      }
    }
  }
})
