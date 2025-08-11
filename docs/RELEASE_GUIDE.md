# 发布指南

本文档说明如何使用 GitHub Actions 自动构建和发布 ToolBoxs 的多平台安装包。

## 🚀 自动发布流程

### 1. 版本标签发布（推荐）

当您准备发布新版本时，创建并推送版本标签：

```bash
# 创建版本标签
git tag v1.0.0

# 推送标签到远程仓库
git push origin v1.0.0
```

这将自动触发 GitHub Actions 工作流，构建所有平台的安装包并创建 GitHub Release。

### 2. 手动触发发布

您也可以在 GitHub 仓库的 Actions 页面手动触发构建：

1. 进入 GitHub 仓库的 "Actions" 标签页
2. 选择 "Build and Release Electron App" 工作流
3. 点击 "Run workflow" 按钮
4. 输入版本号（如 v1.0.0）
5. 点击 "Run workflow" 开始构建

## 📦 构建产物

工作流将为以下平台构建安装包：

### macOS
- **文件格式**: `.dmg`
- **架构支持**: Universal (Intel + Apple Silicon)
- **文件名**: `ToolBoxs-v1.0.0-universal.dmg`
- **特性**: 
  - 支持 Intel 和 Apple Silicon Mac
  - 拖拽安装界面
  - 自动更新支持

### Windows
- **文件格式**: `.exe`
- **架构支持**: x64
- **文件名**: `ToolBoxs-v1.0.0-Setup.exe`
- **特性**:
  - NSIS 安装程序
  - 开始菜单快捷方式
  - 卸载程序

### Linux
- **文件格式**: `.AppImage`
- **架构支持**: x64
- **文件名**: `ToolBoxs-v1.0.0.AppImage`
- **特性**:
  - 便携式应用
  - 无需安装，直接运行
  - 自包含所有依赖

## 🔧 工作流配置

### 触发条件

```yaml
on:
  push:
    tags:
      - 'v*.*.*'  # 版本标签格式：v1.0.0
  workflow_dispatch:  # 手动触发
```

### 构建矩阵

工作流使用矩阵策略同时在多个操作系统上构建：

- **macOS**: `macos-latest`
- **Windows**: `windows-latest` 
- **Linux**: `ubuntu-latest`

### 构建步骤

1. **代码检出**: 获取最新代码
2. **环境设置**: 安装 Node.js 20
3. **依赖安装**: 安装 npm 依赖
4. **类型检查**: 运行 TypeScript 类型检查
5. **应用构建**: 使用 `npm run electron:build`
6. **平台打包**: 使用 `npm run electron:dist`
7. **文件上传**: 上传构建产物
8. **发布创建**: 创建 GitHub Release

## 📋 发布前检查清单

在发布新版本前，请确保：

- [ ] 所有功能已测试完成
- [ ] 更新了版本号（package.json）
- [ ] 更新了 CHANGELOG.md
- [ ] 所有测试通过
- [ ] 代码已合并到 main 分支
- [ ] 本地构建测试成功

## 🛠️ 本地构建测试

在推送标签前，建议先在本地测试构建：

```bash
# 进入应用目录
cd app

# 安装依赖
npm install

# 类型检查
npm run type-check

# 构建 Electron 应用
npm run electron:build

# 生成分发包
npm run electron:dist
```

构建完成后，检查 `dist-electron` 目录中的文件。

## 🔍 故障排除

### 常见问题

#### 1. 构建失败
- 检查 Node.js 版本是否为 20
- 确保所有依赖已正确安装
- 查看 GitHub Actions 日志获取详细错误信息

#### 2. DMG 文件过大
- 检查是否包含了不必要的文件
- 优化 `files` 配置，排除开发文件

#### 3. 代码签名问题
- macOS 构建跳过了代码签名（`CSC_IDENTITY_AUTO_DISCOVERY: false`）
- 如需代码签名，需要配置开发者证书

#### 4. 发布权限问题
- 确保仓库有 `contents: write` 权限
- 检查 `GITHUB_TOKEN` 是否有效

### 调试技巧

1. **查看构建日志**:
   - 在 GitHub Actions 页面查看详细日志
   - 关注 "List build artifacts" 步骤的输出

2. **下载构建产物**:
   - 即使发布失败，也可以从 Artifacts 下载构建文件
   - 用于本地测试和调试

3. **本地复现**:
   - 在对应操作系统上本地运行相同的构建命令
   - 使用相同的 Node.js 版本

## 📈 版本管理

### 语义化版本

建议使用语义化版本号：

- `v1.0.0`: 主版本（重大更新）
- `v1.1.0`: 次版本（新功能）
- `v1.1.1`: 修订版本（bug 修复）

### 预发布版本

对于测试版本，可以使用预发布标签：

- `v1.0.0-alpha.1`: Alpha 版本
- `v1.0.0-beta.1`: Beta 版本
- `v1.0.0-rc.1`: Release Candidate

## 🔄 自动更新

electron-builder 会自动生成更新配置文件：

- `latest-mac.yml`: macOS 更新配置
- `latest.yml`: Windows 更新配置  
- `latest-linux.yml`: Linux 更新配置

这些文件可用于实现应用的自动更新功能。

## 📚 相关文档

- [Electron Builder 文档](https://www.electron.build/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [构建配置指南](./BUILD_CONFIGURATION_GUIDE.md)