# 构建配置指南

本项目已配置了根据不同编译方式自动设置不同前缀的功能，满足不同部署场景的需求。

## 构建配置说明

### 1. 自动前缀配置

项目通过 `vite.config.ts` 中的智能配置，根据环境变量自动设置正确的资源路径前缀：

```typescript
// 根据不同的构建目标设置 base 路径
const getBasePath = () => {
  // Electron 应用始终使用相对路径
  if (process.env.ELECTRON === 'true') {
    return './';
  }
  
  // 根据部署目标设置路径
  switch (process.env.DEPLOY_TARGET) {
    case 'github-pages':
      return '/toolboxs/';  // GitHub Pages 子路径
    case 'production':
      return '/';           // 生产环境根路径
    default:
      return process.env.NODE_ENV === 'production' ? '/toolboxs/' : '/';
  }
};
```

### 2. 构建脚本

#### GitHub Pages 构建
```bash
npm run build:github
```
- 使用前缀：`/toolboxs/`
- 适用于：GitHub Pages 部署
- 资源路径示例：`/toolboxs/assets/index.js`

#### 生产环境构建
```bash
npm run build:production
```
- 使用前缀：`/`
- 适用于：服务器根目录部署
- 资源路径示例：`/assets/index.js`

#### Electron 应用构建
```bash
npm run build:electron
# 或者
npm run electron:pack
```
- 使用前缀：`./`（相对路径）
- 适用于：桌面应用打包
- 资源路径示例：`./assets/index.js`

### 3. 构建结果验证

不同构建方式生成的 `dist/index.html` 文件中的资源引用：

#### GitHub Pages 版本
```html
<link rel="icon" href="/toolboxs/favicon.ico">
<script type="module" crossorigin src="/toolboxs/assets/index-xxx.js"></script>
<link rel="stylesheet" crossorigin href="/toolboxs/assets/index-xxx.css">
```

#### 生产环境版本
```html
<link rel="icon" href="/favicon.ico">
<script type="module" crossorigin src="/assets/index-xxx.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-xxx.css">
```

#### Electron 版本
```html
<link rel="icon" href="./favicon.ico">
<script type="module" crossorigin src="./assets/index-xxx.js"></script>
<link rel="stylesheet" crossorigin href="./assets/index-xxx.css">
```

### 4. 环境变量说明

- `ELECTRON=true`：标识为 Electron 应用构建
- `DEPLOY_TARGET=github-pages`：标识为 GitHub Pages 部署
- `DEPLOY_TARGET=production`：标识为生产环境部署
- `NODE_ENV=production`：生产环境标识

### 5. 完整的构建和部署流程

#### 开发环境
```bash
npm run dev
```

#### GitHub Pages 部署
```bash
npm run build:github
# 将 dist 目录内容部署到 GitHub Pages
```

#### 生产服务器部署
```bash
npm run build:production
# 将 dist 目录内容部署到服务器根目录
```

#### Electron 桌面应用
```bash
npm run electron:pack
# 生成的应用在 dist-electron 目录
```

#### 调试模式
```bash
npm run electron:debug
# 以调试模式启动打包后的 Electron 应用
```

## 技术实现

### Vite 配置优化

通过在 `vite.config.ts` 中使用立即执行函数和环境变量检测，实现了：

1. **智能路径识别**：自动根据构建环境设置正确的 base 路径
2. **多场景支持**：支持开发、GitHub Pages、生产环境、Electron 等多种场景
3. **配置集中化**：所有路径配置逻辑集中在一个函数中，便于维护
4. **向后兼容**：保持与现有构建流程的兼容性

### 构建脚本优化

在 `package.json` 中新增了专门的构建脚本：

- `build:github`：专用于 GitHub Pages 构建
- `build:production`：专用于生产环境构建
- `build:electron`：专用于 Electron 应用构建

这样的设计确保了不同部署场景下的资源路径都能正确配置，解决了之前 Electron 应用空白页面的问题。