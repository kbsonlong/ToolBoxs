# 构建优化指南

本文档说明如何优化 Electron 应用的构建性能和包大小。

## 🚀 代码分割优化

### 问题描述

在构建过程中可能会遇到以下警告：

```
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking
```

### 解决方案

#### 1. 手动代码分割配置

在 `vite.config.ts` 中配置 `manualChunks`：

```typescript
build: {
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
```

#### 2. 动态导入优化

对于大型组件或页面，使用动态导入：

```typescript
// 路由懒加载
const routes = [
  {
    path: '/base64',
    component: () => import('@/views/Base64View.vue')
  },
  {
    path: '/json-formatter',
    component: () => import('@/views/JsonFormatterView.vue')
  }
]

// 组件懒加载
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
```

## 🛠️ 构建环境优化

### GitHub Actions 优化

#### 1. 跳过不必要的依赖安装

```yaml
- name: Install dependencies
  run: npm ci
  working-directory: ./app
  env:
    CYPRESS_INSTALL_BINARY: 0  # 跳过 Cypress 二进制文件安装
```

#### 2. Windows 构建优化

```yaml
- name: Clean Windows cache (Windows only)
  if: matrix.os == 'windows-latest'
  run: |
    if (Test-Path "node_modules") {
      Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    }
    npm cache clean --force
  working-directory: ./app
  shell: powershell
```

#### 3. 统一环境变量配置

```yaml
env:
  ELECTRON_BUILDER_CACHE: .cache/electron-builder
  CYPRESS_INSTALL_BINARY: 0
```

## 📊 性能监控

### 构建分析

#### 1. 包大小分析

使用 `rollup-plugin-visualizer` 分析包大小：

```bash
npm install --save-dev rollup-plugin-visualizer
```

在 `vite.config.ts` 中添加：

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    })
  ]
})
```

#### 2. 构建时间优化

```typescript
build: {
  // 启用多线程构建
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true, // 移除 console.log
      drop_debugger: true // 移除 debugger
    }
  },
  // 启用源码映射（开发时）
  sourcemap: process.env.NODE_ENV === 'development'
}
```

## 🔧 Electron 特定优化

### 1. 主进程优化

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron')

// 启用 V8 代码缓存
app.commandLine.appendSwitch('enable-v8-code-cache')

// 禁用不必要的功能
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor')
```

### 2. 渲染进程优化

```typescript
// 预加载关键资源
const criticalResources = [
  '/api/config',
  '/assets/icons/sprite.svg'
]

criticalResources.forEach(resource => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = resource
  document.head.appendChild(link)
})
```

### 3. 打包优化

```json
{
  "build": {
    "compression": "maximum",
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "mac": {
      "target": {
        "target": "dmg",
        "arch": ["universal"]
      }
    },
    "linux": {
      "target": {
        "target": "AppImage",
        "arch": ["x64"]
      }
    }
  }
}
```

## 📈 性能最佳实践

### 1. 代码层面优化

```typescript
// 使用 shallowRef 代替 ref（适用于大型对象）
import { shallowRef } from 'vue'
const largeData = shallowRef({})

// 使用 markRaw 标记不需要响应式的对象
import { markRaw } from 'vue'
const staticData = markRaw({
  // 大量静态数据
})

// 组件懒加载
const LazyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 2. 资源优化

```typescript
// 图片懒加载
const useImageLazyLoad = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.dataset.src!
        observer.unobserve(img)
      }
    })
  })
  
  return { observer }
}

// 虚拟滚动（大列表优化）
import { VirtualList } from '@tanstack/vue-virtual'
```

### 3. 缓存策略

```typescript
// Service Worker 缓存
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}

// 内存缓存
const cache = new Map()
const getCachedData = (key: string) => {
  if (cache.has(key)) {
    return cache.get(key)
  }
  const data = fetchData(key)
  cache.set(key, data)
  return data
}
```

## 🐛 常见问题解决

### 1. 内存泄漏

```typescript
// 正确清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  clearInterval(timer)
})

// 使用 WeakMap 避免内存泄漏
const weakCache = new WeakMap()
```

### 2. 构建失败

```bash
# 清理缓存
npm run clean
rm -rf node_modules
npm install

# 检查依赖冲突
npm ls
npm audit
```

### 3. 性能监控

```typescript
// 性能监控
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`)
  })
})
observer.observe({ entryTypes: ['measure', 'navigation'] })
```

## 📋 优化检查清单

- [ ] 配置代码分割（manualChunks）
- [ ] 启用组件懒加载
- [ ] 优化图片和静态资源
- [ ] 配置 Service Worker 缓存
- [ ] 移除未使用的依赖
- [ ] 启用生产环境优化
- [ ] 配置 Electron 构建优化
- [ ] 设置性能监控
- [ ] 测试不同平台的构建
- [ ] 验证包大小和加载时间

## 🔗 相关资源

- [Vite 构建优化](https://vitejs.dev/guide/build.html)
- [Rollup 代码分割](https://rollupjs.org/guide/en/#code-splitting)
- [Vue 3 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [Electron 性能优化](https://www.electronjs.org/docs/latest/tutorial/performance)
- [Element Plus 按需导入](https://element-plus.org/en-US/guide/quickstart.html#on-demand-import)

---

*最后更新：2024年12月19日*