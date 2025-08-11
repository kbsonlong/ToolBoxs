# Electron 应用调试指南

## 问题描述

如果你发现打包后的 Electron 应用显示空白页面，这通常是由于以下原因：

1. **资源路径问题**：生产环境的资源路径配置不正确
2. **构建配置问题**：Vite 构建时使用了错误的 base 路径
3. **环境变量问题**：Electron 应用无法正确识别运行环境

## 解决方案

### 1. 正确构建 Electron 版本

使用以下命令构建专门为 Electron 优化的版本：

```bash
# 设置 ELECTRON 环境变量进行构建
ELECTRON=true npm run build-only

# 然后打包 Electron 应用
ELECTRON=true npm run electron:pack
```

### 2. 启用调试模式

我们为生产环境的 Electron 应用添加了调试模式支持，有以下几种启动方式：

#### 方式一：使用 npm 脚本

```bash
# 启动调试模式（会自动打开开发者工具）
npm run electron:debug

# 重新打包并启动调试模式
npm run electron:pack-debug
```

#### 方式二：使用环境变量

```bash
# 设置 DEBUG 环境变量启动
DEBUG=true open dist-electron/mac-arm64/Toolboxs.app
```

#### 方式三：使用启动脚本

```bash
# 使用提供的启动脚本
./start-debug.sh
```

#### 方式四：使用命令行参数

```bash
# 直接运行可执行文件并传递 --debug 参数
./dist-electron/mac-arm64/Toolboxs.app/Contents/MacOS/Toolboxs --debug
```

### 3. 调试步骤

当应用在调试模式下启动时，会自动打开开发者工具，你可以：

1. **检查控制台错误**：查看 Console 标签页中的错误信息
2. **检查网络请求**：查看 Network 标签页中的资源加载情况
3. **检查元素**：查看 Elements 标签页中的 DOM 结构
4. **检查资源**：查看 Sources 标签页中的文件加载情况

### 4. 常见问题排查

#### 问题：页面完全空白
- **检查**：控制台是否有 JavaScript 错误
- **解决**：确保使用 `ELECTRON=true` 环境变量进行构建

#### 问题：资源文件 404 错误
- **检查**：Network 标签页中的资源请求路径
- **解决**：确认 `vite.config.ts` 中的 base 路径配置正确

#### 问题：Vue 应用未初始化
- **检查**：`#app` 元素是否存在且为空
- **解决**：检查 Vue 应用的挂载过程和路由配置

## 技术实现

### Vite 配置

在 `vite.config.ts` 中，我们使用条件配置来处理不同环境的 base 路径：

```typescript
base: process.env.ELECTRON === 'true' ? './' : (process.env.NODE_ENV === 'production' ? '/toolboxs/' : '/'),
```

- **开发环境**：使用 `/` 作为 base 路径
- **GitHub Pages**：使用 `/toolboxs/` 作为 base 路径
- **Electron 应用**：使用 `./` 作为 base 路径（相对路径）

### Electron 主进程配置

在 `electron/main.js` 中，我们添加了调试模式支持：

```javascript
const isDebug = process.env.DEBUG === 'true' || process.argv.includes('--debug')

// 生产环境下如果启用调试模式，也打开开发者工具
if (isDebug) {
  mainWindow.webContents.openDevTools()
}
```

## 构建脚本说明

- `npm run electron:dev`：开发模式，连接到 Vite 开发服务器
- `npm run electron:pack`：打包应用到 `dist-electron` 目录
- `npm run electron:debug`：以调试模式启动已打包的应用
- `npm run electron:pack-debug`：重新打包并启动调试模式
- `npm run electron:build`：构建完整的安装包（DMG/EXE）

## 注意事项

1. **环境变量**：确保在构建时设置正确的环境变量
2. **路径问题**：Electron 应用中的资源路径必须使用相对路径
3. **调试工具**：生产环境默认不开启开发者工具，需要显式启用调试模式
4. **代码签名**：未签名的应用在 macOS 上可能需要手动允许运行

通过以上配置，你现在可以轻松调试打包后的 Electron 应用，快速定位和解决空白页面等问题。