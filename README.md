# ToolBoxs 工具宝

一站式在线实用工具平台，提供各种常用的开发和日常工具。

## 🚀 功能特性

- **Base64编码解码** - 字符串与Base64格式互转
- **MD5哈希计算** - MD5哈希值计算和验证
- **JSON格式化** - JSON格式化、验证和压缩
- **时间格式转换** - 时间戳转换和格式化
- **密码生成器** - 安全密码生成和强度检测
- **QR码生成器** - QR码生成和自定义
- **TLS证书验证** - TLS/SSL证书解析和验证
- **Base64证书解析** - Base64编码证书解析

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **UI组件**: Element Plus
- **构建工具**: Vite
- **桌面应用**: Electron
- **部署平台**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📦 安装和运行

```bash
# 进入应用目录
cd app

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🔧 GitHub Pages 部署

本项目已配置自动部署到GitHub Pages。当代码推送到`main`分支时，GitHub Actions会自动构建和部署应用。

### SPA路由404问题解决

项目已经实现了GitHub Pages SPA路由404问题的完整解决方案：

- ✅ 支持直接访问子路径（如 `/toolboxs/base64`）
- ✅ 支持页面刷新不丢失路由
- ✅ 支持浏览器前进后退按钮
- ✅ 保持URL美观（History模式）

详细解决方案请查看：[GitHub Pages SPA 404问题解决方案](./docs/github-pages-spa-404-solution.md)

## 📁 项目结构

```
toolboxs/
├── .github/workflows/     # GitHub Actions配置
├── app/                   # Vue应用主目录
│   ├── public/           # 静态资源
│   │   └── 404.html     # SPA路由404解决方案
│   ├── src/             # 源代码
│   │   ├── components/  # 组件
│   │   ├── views/       # 页面视图
│   │   ├── router/      # 路由配置
│   │   ├── stores/      # 状态管理
│   │   └── utils/       # 工具函数
│   └── ...
├── docs/                 # 文档目录
└── utility-tools/        # 工具设计文档
```

## 🖥️ 桌面应用

项目同时支持 **Electron** 和 **Tauri** 两种桌面应用解决方案：

### Electron 桌面应用

#### 本地开发

```bash
# 开发模式运行 Electron
npm run electron:dev

# 构建 Electron 应用
npm run electron:build

# 打包发布版本
npm run electron:dist
```

### Tauri 桌面应用

#### 本地开发

```bash
# 开发模式运行 Tauri
npm run tauri:dev

# 构建 Tauri 应用
npm run tauri:build

# 调试构建
npm run tauri:build:debug
```

#### Tauri 优势

- **体积更小**: 应用包体积显著减少
- **性能更好**: 使用系统原生 WebView
- **安全性强**: 更严格的安全模型
- **资源占用低**: 内存和 CPU 使用更少
- **跨平台支持**: Windows、macOS、Linux

### 自动版本管理

项目支持基于 Git tag 的自动版本更新：

**通过 Git Tag 触发构建：**
```bash
git tag v1.2.3
git push origin v1.2.3
```

**手动触发构建：**
1. 访问 GitHub Actions 页面
2. 选择 "Build and Release Electron App"
3. 点击 "Run workflow" 并输入版本号

系统会自动：
- 更新 `package.json` 中的版本号
- 构建 macOS、Windows、Linux 版本
- 创建 GitHub Release

详细说明请查看：[版本自动更新指南](./docs/VERSION_AUTO_UPDATE_GUIDE.md)

## 🧪 测试与发布

### 本地测试

#### Electron 构建测试

运行完整的 Electron 构建测试：

```bash
# 执行 Electron 构建测试脚本
./scripts/test-build.sh
```

该脚本会验证：
- 环境配置
- 类型检查
- 多种构建方式
- 资源路径配置
- Electron 打包

#### Tauri 构建测试

运行完整的 Tauri 构建测试：

```bash
# 执行 Tauri 构建测试脚本
./scripts/test-tauri-build.sh
```

该脚本会验证：
- Rust 环境配置
- Tauri CLI 安装
- 前端构建
- Tauri 调试构建
- 构建产物检查

### 自动发布

项目配置了 GitHub Actions 自动构建和发布流程：

#### Electron 应用发布

```bash
# 创建版本标签触发 Electron 自动构建
git tag v1.0.0
git push origin v1.0.0
```

自动构建将生成：
- **macOS**: Universal DMG 安装包
- **Windows**: NSIS 安装程序
- **Linux**: AppImage 便携应用

#### Tauri 应用发布

```bash
# 创建 Tauri 版本标签触发自动构建
git tag tauri-v1.0.0
git push origin tauri-v1.0.0
```

或者手动触发构建：
1. 访问 GitHub Actions 页面
2. 选择 "Tauri Build and Release"
3. 点击 "Run workflow" 并输入版本号

Tauri 自动构建将生成：
- **macOS**: DMG 安装包和 .app 应用包
- **Windows**: MSI 安装程序和便携版
- **Linux**: AppImage 和 DEB 包

### GitHub Action 配置说明

项目使用了专业的 `samuelmeuli/action-electron-builder` Action，实现了简化且稳定的构建流程：

- 🚀 **简化配置**: 使用专门的 Electron 构建 Action，自动处理构建和发布
- 🔧 **内置优化**: 针对 Electron 应用优化的构建流程和缓存策略
- 🌍 **跨平台支持**: 自动支持 macOS、Windows 和 Linux 三大平台
- 📦 **智能发布**: 根据版本标签自动创建 GitHub Release
- ✅ **问题解决**: 彻底解决了 Token 配置和跨平台兼容性问题

#### 主要改进

- **单一 Job**: 不再需要复杂的构建和发布分离
- **自动管理**: Action 自动处理 GitHub token 和发布流程
- **稳定性**: 使用成熟的社区解决方案，提高构建成功率
- **维护性**: 大幅简化配置文件，易于维护和理解
- **权限配置**: 添加 `contents: write` 权限解决 GitHub API 访问问题
- **发布冲突解决**: 配置 `releaseType: "release"` 避免发布类型冲突
- **macOS 兼容性**: 配置 `hardenedRuntime` 和 `gatekeeperAssess` 解决应用损坏问题

> 📖 详细说明请查看：
> - [GitHub Action 配置指南](docs/GITHUB_ACTION_SETUP.md) **← Electron 构建配置说明**
> - [Tauri GitHub Action 配置指南](docs/TAURI_GITHUB_ACTION_SETUP.md) **← Tauri 构建配置说明**
> - [Tauri 构建示例](docs/TAURI_BUILD_EXAMPLE.md) **← Tauri 构建完整示例**
> - [macOS 应用安装指南](docs/MACOS_APP_INSTALL_GUIDE.md) **← 解决"应用已损坏"问题**
> - [发布指南](docs/RELEASE_GUIDE.md)
> - [构建配置指南](docs/BUILD_CONFIGURATION_GUIDE.md)
> - [Electron 调试指南](docs/ELECTRON_DEBUG_GUIDE.md)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [在线访问](https://your-username.github.io/toolboxs/)
- [问题反馈](https://github.com/your-username/toolboxs/issues)
- [功能建议](https://github.com/your-username/toolboxs/discussions)

---

*最后更新：2024年12月19日*