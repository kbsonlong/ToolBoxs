# Tauri GitHub Actions 构建示例

本文档提供了使用 GitHub Actions 构建 Tauri 桌面应用的完整示例和最佳实践。

## 📋 目录

- [快速开始](#快速开始)
- [构建流程示例](#构建流程示例)
- [版本发布示例](#版本发布示例)
- [构建产物示例](#构建产物示例)
- [最佳实践](#最佳实践)

## 🚀 快速开始

### 1. 确保项目配置正确

在开始之前，确保你的项目已经正确配置了 Tauri：

```bash
# 检查 Tauri 配置
ls app/src-tauri/tauri.conf.json
ls app/src-tauri/Cargo.toml
ls app/src-tauri/src/main.rs

# 测试本地构建
cd app
npm run tauri:build:debug
```

### 2. 推送代码到 GitHub

```bash
# 添加所有文件
git add .
git commit -m "feat: 添加 Tauri GitHub Actions 构建支持"
git push origin main
```

### 3. 创建版本标签触发构建

```bash
# 创建 Tauri 版本标签
git tag tauri-v1.0.0
git push origin tauri-v1.0.0
```

## 🏗️ 构建流程示例

### 触发构建后的完整流程

1. **GitHub Actions 检测到标签推送**
   ```
   ✅ 检测到标签: tauri-v1.0.0
   ✅ 触发工作流: Tauri Build and Release
   ```

2. **并行构建多架构多平台**
   ```
   🖥️  macOS Intel (x86_64-apple-darwin)
   🖥️  macOS Apple Silicon (aarch64-apple-darwin)
   🐧 Linux (ubuntu-22.04, x86_64)
   🪟 Windows (windows-latest, x86_64)
   ```

3. **每个平台的构建步骤**
   ```
   ✅ 检出代码
   ✅ 安装系统依赖 (Linux)
   ✅ 设置 Rust 环境
   ✅ 配置 Rust 缓存
   ✅ 设置 Node.js 环境
   ✅ 安装前端依赖
   ✅ 更新版本号
   ✅ 类型检查
   ✅ 构建前端
   ✅ 构建 Tauri 应用
   ✅ 上传到 GitHub Release
   ```

### 构建时间参考

| 平台 | 架构 | 预计时间 | 主要耗时步骤 |
|------|------|----------|-------------|
| **macOS** | Intel (x86_64) | 8-12 分钟 | Rust 编译 (5-8分钟) |
| **macOS** | Apple Silicon (ARM64) | 8-12 分钟 | Rust 编译 (5-8分钟) |
| **Linux** | x86_64 | 6-10 分钟 | 系统依赖安装 + Rust 编译 |
| **Windows** | x86_64 | 10-15 分钟 | Rust 编译 + 打包 |

## 📦 版本发布示例

### 方式一：Git 标签触发（推荐）

```bash
# 1. 更新版本信息（可选，构建时会自动更新）
cd app
npm version 1.0.0 --no-git-tag-version

# 2. 提交更改
git add .
git commit -m "chore: 发布 v1.0.0"
git push origin main

# 3. 创建并推送标签
git tag tauri-v1.0.0
git push origin tauri-v1.0.0

# 4. 查看构建进度
echo "🔗 访问: https://github.com/your-username/toolboxs/actions"
```

### 方式二：手动触发

1. **访问 GitHub Actions 页面**
   ```
   https://github.com/your-username/toolboxs/actions
   ```

2. **选择工作流**
   ```
   点击 "Tauri Build and Release"
   ```

3. **手动触发**
   ```
   点击 "Run workflow"
   选择分支: main
   输入版本: v1.0.0
   点击 "Run workflow"
   ```

### 版本号规范

| 标签格式 | 示例 | 说明 |
|----------|------|------|
| `tauri-v{major}.{minor}.{patch}` | `tauri-v1.0.0` | 正式版本 |
| `tauri-v{major}.{minor}.{patch}-beta.{num}` | `tauri-v1.0.0-beta.1` | 测试版本 |
| `tauri-v{major}.{minor}.{patch}-alpha.{num}` | `tauri-v1.0.0-alpha.1` | 预览版本 |

## 📁 构建产物示例

### 成功构建后的 GitHub Release

```
📦 Release: Tauri App tauri-v1.0.0

🖥️ macOS (Intel x86_64):
├── toolboxs_1.0.0_x64.dmg          (12.5 MB) - DMG 安装包 (Intel)
└── toolboxs.app.tar.gz             (8.2 MB)  - 应用包压缩文件 (Intel)

🖥️ macOS (Apple Silicon ARM64):
├── toolboxs_1.0.0_aarch64.dmg      (11.8 MB) - DMG 安装包 (Apple Silicon)
└── toolboxs.app.tar.gz             (7.9 MB)  - 应用包压缩文件 (Apple Silicon)

🪟 Windows (x86_64):
├── toolboxs_1.0.0_x64_en-US.msi    (15.3 MB) - MSI 安装程序
└── toolboxs_1.0.0_x64.exe          (18.7 MB) - 便携版可执行文件

🐧 Linux (x86_64):
├── toolboxs_1.0.0_amd64.AppImage   (22.1 MB) - AppImage 便携应用
└── toolboxs_1.0.0_amd64.deb        (8.9 MB)  - Debian 安装包
```

### 文件大小对比（参考）

| 平台 | Tauri | Electron | 减少比例 |
|------|-------|----------|----------|
| **macOS DMG** | ~12 MB | ~85 MB | 85% ↓ |
| **Windows MSI** | ~15 MB | ~95 MB | 84% ↓ |
| **Linux AppImage** | ~22 MB | ~110 MB | 80% ↓ |

## 🎯 最佳实践

### 1. 版本管理策略

```bash
# 开发版本
git tag tauri-v1.0.0-alpha.1

# 测试版本
git tag tauri-v1.0.0-beta.1

# 正式版本
git tag tauri-v1.0.0

# 补丁版本
git tag tauri-v1.0.1
```

### 2. 构建前检查清单

- [ ] 本地 Tauri 构建成功
- [ ] 前端类型检查通过
- [ ] 运行测试脚本验证
- [ ] 更新 CHANGELOG.md
- [ ] 确认版本号正确

### 3. 发布流程建议

```bash
# 1. 功能开发完成
git checkout -b feature/new-feature
# ... 开发工作 ...
git push origin feature/new-feature

# 2. 合并到主分支
git checkout main
git merge feature/new-feature
git push origin main

# 3. 本地测试
./scripts/test-tauri-build.sh

# 4. 创建发布标签
git tag tauri-v1.0.0
git push origin tauri-v1.0.0

# 5. 监控构建进度
# 访问 GitHub Actions 页面查看构建状态

# 6. 验证发布
# 下载构建产物进行测试
```

### 4. 故障处理流程

```bash
# 如果构建失败，检查日志
# 1. 访问 GitHub Actions 页面
# 2. 点击失败的工作流
# 3. 查看具体步骤的错误信息

# 常见问题修复后重新发布
git tag -d tauri-v1.0.0                    # 删除本地标签
git push origin :refs/tags/tauri-v1.0.0    # 删除远程标签
# 修复问题后
git tag tauri-v1.0.0                       # 重新创建标签
git push origin tauri-v1.0.0               # 重新推送标签
```

### 5. 多环境发布策略

```bash
# 开发环境（自动触发）
git push origin main
# → 触发开发构建（可选）

# 测试环境
git tag tauri-v1.0.0-beta.1
git push origin tauri-v1.0.0-beta.1
# → 创建预发布版本

# 生产环境
git tag tauri-v1.0.0
git push origin tauri-v1.0.0
# → 创建正式发布版本
```

## 🔧 自定义配置示例

### 修改构建平台

如果只需要构建特定平台，可以修改 `.github/workflows/tauri-build.yml`：

```yaml
# 只构建 macOS
strategy:
  matrix:
    platform: [macos-latest]

# 只构建 Windows 和 Linux
strategy:
  matrix:
    platform: [ubuntu-20.04, windows-latest]
```

### 添加代码签名

```yaml
# 在 .github/workflows/tauri-build.yml 中取消注释
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
  APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
  # ... 其他签名相关环境变量
```

### 自定义发布信息

```yaml
with:
  tagName: ${{ github.ref_name }}
  releaseName: 'ToolBoxs Desktop ${{ github.ref_name }}'
  releaseBody: |
    ## 🎉 新版本发布
    
    ### ✨ 新功能
    - 添加了新的工具
    - 改进了用户界面
    
    ### 🐛 修复
    - 修复了已知问题
    
    ### 📦 下载
    请选择适合你操作系统的安装包进行下载。
  releaseDraft: false  # 直接发布，不创建草稿
```

## 📚 相关资源

- [Tauri 官方文档](https://tauri.app/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [语义化版本规范](https://semver.org/)
- [项目 Tauri 配置指南](./TAURI_GITHUB_ACTION_SETUP.md)

---

*最后更新：2024年12月19日*