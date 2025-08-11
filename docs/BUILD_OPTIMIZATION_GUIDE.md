# Electron 应用构建优化指南

本指南详细说明了如何优化 Electron 应用的构建过程，解决常见的构建问题，并提升应用性能。

## 目录
- [代码分割优化](#代码分割优化)
- [构建环境优化](#构建环境优化)
- [性能监控](#性能监控)
- [Electron 特定优化](#electron-特定优化)
- [常见问题解决](#常见问题解决)
- [优化检查清单](#优化检查清单)

## 代码分割优化

### 1. 手动配置 manualChunks

在 `vite.config.ts` 中配置代码分割：

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库分离
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将 Element Plus 分离
          'element-plus': ['element-plus'],
          // 将工具库分离
          'utils': ['crypto-js', 'qrcode', 'node-forge'],
          // 将其他大型依赖分离
          'vendor': ['@element-plus/icons-vue']
        }
      }
    },
    // 调整包大小警告阈值
    chunkSizeWarningLimit: 1000
  }
})
```

### 2. 动态导入

对于大型组件或功能模块，使用动态导入：

```typescript
// 路由懒加载
const routes = [
  {
    path: '/about',
    component: () => import('@/views/AboutView.vue')
  }
]

// 组件懒加载
const LazyComponent = defineAsyncComponent(() => import('@/components/HeavyComponent.vue'))
```

## 构建环境优化

### GitHub Actions 优化

#### 1. 跳过不必要的依赖安装

```yaml
- name: Install dependencies
  run: npm ci
  env:
    CYPRESS_INSTALL_BINARY: 0  # 跳过 Cypress 二进制文件安装
    ELECTRON_BUILDER_CACHE: ${{ runner.temp }}/electron-builder
```

#### 2. Windows 构建优化

```yaml
- name: Clean cache (Windows)
  if: matrix.os == 'windows-latest'
  run: |
    if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
    npm cache clean --force
  shell: powershell
  env:
    CYPRESS_INSTALL_BINARY: 0
```

#### 3. 统一环境变量

```yaml
env:
  ELECTRON_BUILDER_CACHE: ${{ runner.temp }}/electron-builder
  CYPRESS_INSTALL_BINARY: 0
  CSC_IDENTITY_AUTO_DISCOVERY: false  # 跳过代码签名
```

## 性能监控

### 1. 包大小分析

```bash
# 构建并分析包大小
npm run build

# 查看构建输出
# 正常的包大小分布：
# - vue-vendor: ~105KB
# - element-plus: ~838KB
# - utils: ~381KB
# - vendor: ~171KB
# - main: ~140KB
```

### 2. 构建时间优化

- 使用 npm ci 而不是 npm install
- 配置适当的缓存策略
- 并行构建多个平台

## Electron 特定优化

### 1. 主进程优化

```javascript
// main.js
const { app, BrowserWindow } = require('electron')

// 启用硬件加速
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder')

// 优化内存使用
app.commandLine.appendSwitch('max-old-space-size', '4096')
```

### 2. 渲染进程优化

```typescript
// 在 Vue 应用中
// 使用 keep-alive 缓存组件
<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

### 3. 打包优化

```json
// package.json
{
  "build": {
    "compression": "maximum",
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    },
    "mac": {
      "target": "dmg"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

## 常见问题解决

### 1. GitHub Token 错误
**问题**: `GitHub Personal Access Token is not set, neither programmatically, nor using env "GH_TOKEN"`

**解决方案**:
- 在 GitHub Actions 中使用 `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`
- 确保 release job 只在 tag 推送时运行
- 构建步骤使用 `--publish=never` 参数

### 2. 代码包过大警告
**问题**: `Some chunks are larger than 500 kB after minification`

**解决方案**:
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vue-vendor': ['vue', 'vue-router', 'pinia'],
        'element-plus': ['element-plus'],
        'utils': ['crypto-js', 'qrcode', 'node-forge'],
        'vendor': ['@element-plus/icons-vue']
      }
    }
  },
  chunkSizeWarningLimit: 1000
}
```

### 3. 依赖解析错误
**问题**: `Could not resolve entry module "jsqr"`

**解决方案**:
- 检查 `package.json` 中的实际依赖
- 确保 `manualChunks` 中只包含项目实际使用的依赖
- 移除未安装或未使用的依赖引用

### 4. 内存泄漏问题
- 检查组件卸载时是否正确清理事件监听器
- 使用 Vue DevTools 监控内存使用情况
- 避免在全局作用域创建大量对象

### 5. 构建失败问题
- 检查依赖版本兼容性
- 清理 node_modules 和重新安装
- 检查 TypeScript 类型错误
- 确保 manualChunks 中的依赖实际存在于项目中

### 6. 性能监控
- 使用 `npm run build` 分析包大小
- 监控首屏加载时间
- 使用 Lighthouse 进行性能评估

## 性能最佳实践

### 1. 代码层面
- 使用 `v-show` 而不是 `v-if` 对于频繁切换的元素
- 合理使用 `computed` 和 `watch`
- 避免在模板中使用复杂的表达式
- 使用 `shallowRef` 和 `shallowReactive` 优化大型对象

### 2. 资源优化
- 压缩图片资源
- 使用 SVG 图标
- 启用 gzip 压缩
- 合理设置缓存策略

### 3. 缓存策略
- 配置适当的 HTTP 缓存头
- 使用 Service Worker 缓存静态资源
- 实现应用级别的数据缓存

## 优化检查清单

### 构建优化
- [ ] 配置代码分割 (manualChunks)
- [ ] 设置合适的 chunkSizeWarningLimit
- [ ] 启用生产环境优化
- [ ] 配置 Tree Shaking

### 依赖优化
- [ ] 移除未使用的依赖
- [ ] 使用轻量级替代方案
- [ ] 配置 externals (如果需要)
- [ ] 检查依赖版本兼容性

### GitHub Actions 优化
- [ ] 跳过不必要的依赖安装
- [ ] 配置适当的缓存策略
- [ ] 使用 `--publish=never` 参数
- [ ] 正确配置 GITHUB_TOKEN

### 运行时优化
- [ ] 启用组件懒加载
- [ ] 使用 keep-alive 缓存组件
- [ ] 优化事件监听器
- [ ] 实现虚拟滚动 (如果需要)

## 相关资源

- [Vite 构建优化](https://vitejs.dev/guide/build.html)
- [Vue 3 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [Electron Builder 配置](https://www.electron.build/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Rollup 配置选项](https://rollupjs.org/configuration-options/)

## 版本历史

- v1.0.0: 初始版本，包含基础优化配置
- v1.1.0: 添加 GitHub Token 问题解决方案
- v1.2.0: 添加代码分割优化和依赖解析错误解决方案