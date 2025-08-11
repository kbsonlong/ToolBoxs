# Vue.js项目打包成MacOS DMG应用指南

本文档详细介绍如何将Vue.js工具箱项目打包成MacOS的dmg应用程序。

## 概述

我们将使用Electron框架将Web应用转换为桌面应用，然后使用electron-builder打包成dmg安装包。

## 第一步：安装依赖

### 1.1 安装Electron相关依赖

```bash
cd app
npm install --save-dev electron electron-builder
npm install --save-dev concurrently wait-on
```

### 1.2 依赖说明

- `electron`: Electron框架核心
- `electron-builder`: 用于打包和分发Electron应用
- `concurrently`: 并行运行多个命令
- `wait-on`: 等待服务启动

## 第二步：创建Electron主进程文件

### 2.1 创建目录结构

```bash
mkdir -p app/electron
```

### 2.2 创建主进程文件

创建 `app/electron/main.js`：

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    titleBarStyle: 'default',
    show: false
  })

  // 开发环境加载本地服务器，生产环境加载打包后的文件
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
```

## 第三步：修改package.json配置

### 3.1 添加主入口和脚本

在 `app/package.json` 中添加：

```json
{
  "main": "electron/main.js",
  "homepage": "./",
  "scripts": {
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:pack": "npm run build && electron-builder",
    "electron:dist": "npm run build && electron-builder --publish=never"
  }
}
```

### 3.2 添加构建配置

在 `app/package.json` 中添加 `build` 配置：

```json
{
  "build": {
    "appId": "com.yourcompany.toolboxs",
    "productName": "开发者工具箱",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/main.js",
      "node_modules/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ],
      "icon": "build/icon.icns"
    },
    "dmg": {
      "title": "开发者工具箱",
      "icon": "build/icon.icns",
      "background": "build/background.png",
      "contents": [
        {
          "x": 130,
          "y": 220
        },
        {
          "x": 410,
          "y": 220,
          "type": "link",
          "path": "/Applications"
        }
      ]
    }
  }
}
```

## 第四步：修改Vite配置

### 4.1 更新vite.config.ts

确保 `app/vite.config.ts` 包含以下配置：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: './', // 重要：设置相对路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

## 第五步：准备应用图标

### 5.1 创建build目录

```bash
mkdir -p app/build
```

### 5.2 准备图标文件

需要准备以下文件：
- `app/build/icon.icns` (MacOS图标，512x512px)
- `app/build/background.png` (DMG背景图，可选)

### 5.3 图标制作工具

可以使用以下工具制作icns图标：
- [Image2icon](http://www.img2icnsapp.com/)
- [IconKit](https://github.com/fanmingming/IconKit)
- 在线工具：[CloudConvert](https://cloudconvert.com/png-to-icns)

## 第六步：构建和测试

### 6.1 开发模式测试

```bash
cd app
npm run electron:dev
```

### 6.2 构建生产版本

```bash
cd app
npm run electron:dist
```

### 6.3 输出文件

成功构建后，在 `app/dist-electron/` 目录下会生成：
- `.dmg` 文件（可分发的安装包）
- `.app` 文件（MacOS应用程序）

## 第七步：高级配置（可选）

### 7.1 代码签名

如果有Apple开发者账号，可以添加代码签名：

```json
{
  "mac": {
    "hardenedRuntime": true,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist",
    "gatekeeperAssess": false
  }
}
```

### 7.2 自动更新

```bash
npm install --save electron-updater
```

## 注意事项

1. **性能优化**：Electron应用会比Web应用占用更多内存
2. **安全性**：确保禁用nodeIntegration，启用contextIsolation
3. **图标准备**：使用高质量的512x512px图标
4. **测试**：在不同MacOS版本上测试应用兼容性
5. **分发**：考虑Apple开发者账号进行代码签名

## 故障排除

### 常见问题

1. **构建失败**：检查Node.js版本是否兼容
2. **图标不显示**：确保icns文件路径正确
3. **应用无法启动**：检查main.js文件路径
4. **白屏问题**：检查base路径配置

### 调试方法

1. 使用 `npm run electron:dev` 进行开发调试
2. 检查控制台错误信息
3. 验证文件路径和权限

## 总结

通过以上步骤，您的Vue.js工具箱应用就可以成功打包成MacOS的dmg安装包。用户可以像安装其他Mac应用一样安装和使用您的工具。