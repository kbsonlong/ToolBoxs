# Tauri GitHub Actions 配置指南

本指南详细说明如何配置 GitHub Actions 来自动构建和发布 Tauri 桌面应用。

## 📋 目录

- [工作流概述](#工作流概述)
- [触发方式](#触发方式)
- [构建矩阵](#构建矩阵)
- [版本管理](#版本管理)
- [代码签名](#代码签名)
- [发布配置](#发布配置)
- [故障排除](#故障排除)

## 🔄 工作流概述

项目使用 `tauri-apps/tauri-action@v0` 官方 Action 来构建 Tauri 应用，支持：

- ✅ 跨平台构建（Windows、macOS、Linux）
- ✅ 自动版本管理
- ✅ GitHub Release 自动发布
- ✅ 代码签名支持（可选）
- ✅ 调试版本构建

## 🚀 触发方式

### 1. Git Tag 触发

```bash
# 创建 Tauri 版本标签
git tag tauri-v1.0.0
git push origin tauri-v1.0.0
```

**标签格式**: `tauri-v*.*.*`（例如：`tauri-v1.0.0`、`tauri-v2.1.3`）

### 2. 手动触发

1. 访问 GitHub 仓库的 Actions 页面
2. 选择 "Tauri Build and Release" 工作流
3. 点击 "Run workflow" 按钮
4. 输入版本号（例如：`v1.0.0`）
5. 点击 "Run workflow" 确认

## 🏗️ 构建矩阵

工作流支持多架构多平台的并行构建：

| 平台 | 运行环境 | 架构 | 输出格式 |
|------|----------|------|----------|
| **Windows** | `windows-latest` | `x86_64` | `.msi`, `.exe` |
| **macOS (Intel)** | `macos-latest` | `x86_64-apple-darwin` | `.dmg`, `.app` |
| **macOS (Apple Silicon)** | `macos-latest` | `aarch64-apple-darwin` | `.dmg`, `.app` |
| **Linux** | `ubuntu-22.04` | `x86_64` | `.AppImage`, `.deb` |

### 多架构支持

- **macOS**: 同时构建 Intel (x86_64) 和 Apple Silicon (ARM64) 版本
- **Windows**: 构建 x86_64 版本
- **Linux**: 构建 x86_64 版本

### Linux 依赖安装

工作流会自动安装 Linux 构建所需的系统依赖：

```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.0-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

> **注意**: webkitgtk 4.0 用于 Tauri v1，webkitgtk 4.1 用于 Tauri v2。可以根据项目版本移除不需要的依赖以加速构建。

## 📦 版本管理

### 自动版本更新

当触发构建时，工作流会自动更新以下文件中的版本号：

1. **前端 package.json**
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **Tauri Cargo.toml**
   ```toml
   [package]
   version = "1.0.0"
   ```

3. **tauri.conf.json**
   ```json
   {
     "package": {
       "version": "1.0.0"
     }
   }
   ```

### 版本号处理

- 自动移除版本号前的 `v` 前缀
- 支持语义化版本格式（如 `1.0.0`、`2.1.3-beta.1`）
- 确保所有配置文件版本号一致

## 🔐 代码签名（可选）

### macOS 代码签名

如需对 macOS 应用进行代码签名，需要在 GitHub 仓库设置中添加以下 Secrets：

```yaml
# 在 .github/workflows/tauri-build.yml 中取消注释
env:
  APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
  APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
  APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

### 所需 Secrets

| Secret 名称 | 描述 |
|-------------|------|
| `APPLE_CERTIFICATE` | Base64 编码的开发者证书 |
| `APPLE_CERTIFICATE_PASSWORD` | 证书密码 |
| `APPLE_SIGNING_IDENTITY` | 签名身份 |
| `APPLE_ID` | Apple ID |
| `APPLE_PASSWORD` | App 专用密码 |
| `APPLE_TEAM_ID` | 开发者团队 ID |

## 📋 发布配置

### Release 设置

```yaml
with:
  projectPath: './app'                         # 项目路径
  tauriScript: 'npm run tauri'               # Tauri CLI 执行脚本（重要！）
  tagName: ${{ github.ref_name }}              # 使用触发的标签名
  releaseName: 'Tauri App ${{ github.ref_name }}'  # Release 标题
  releaseBody: 'See the assets to download this version and install.'  # Release 描述
  releaseDraft: true                           # 创建草稿 Release
  prerelease: false                            # 不标记为预发布
  includeDebug: false                          # 不包含调试版本
  includeRelease: true                         # 包含发布版本
  args: ${{ matrix.args }}                     # 多架构构建参数
```

### 构建产物

构建完成后，以下文件会自动上传到 GitHub Release：

**Windows:**
- `toolboxs_1.0.0_x64_en-US.msi` - MSI 安装程序
- `toolboxs_1.0.0_x64.exe` - 便携版可执行文件

**macOS (Intel x86_64):**
- `toolboxs_1.0.0_x64.dmg` - DMG 安装包 (Intel)
- `toolboxs.app.tar.gz` - 应用包压缩文件 (Intel)

**macOS (Apple Silicon ARM64):**
- `toolboxs_1.0.0_aarch64.dmg` - DMG 安装包 (Apple Silicon)
- `toolboxs.app.tar.gz` - 应用包压缩文件 (Apple Silicon)

**Linux:**
- `toolboxs_1.0.0_amd64.AppImage` - AppImage 便携应用
- `toolboxs_1.0.0_amd64.deb` - Debian 安装包

## 🐛 故障排除

### 常见问题

#### 1. 构建失败：Missing script "tauri"

**问题**: `npm error Missing script: "tauri"`

**原因**: tauri-action 默认尝试运行 `npm run tauri build`，但需要正确配置 tauriScript 参数

**解决方案**:
```yaml
# 在 tauri-action 配置中指定正确的 Tauri CLI 脚本
with:
  tauriScript: 'npm run tauri'  # 指定 Tauri CLI 执行脚本，action 会自动添加 build 命令
```

同时需要在 package.json 中添加 tauri 脚本：
```json
{
  "scripts": {
    "tauri": "tauri"
  }
}
```

#### 2. 构建失败：依赖安装错误

**问题**: Linux 构建时系统依赖安装失败

**解决方案**:
```yaml
# 确保 Ubuntu 版本正确
runs-on: ubuntu-20.04  # 不要使用 ubuntu-latest
```

#### 3. 版本更新失败

**问题**: sed 命令在不同平台表现不一致

**解决方案**: 工作流已使用跨平台兼容的 sed 命令

#### 4. Rust 缓存问题

**问题**: Rust 编译缓存导致构建失败

**解决方案**:
```yaml
# 清理缓存后重新构建
- name: Clean Rust cache
  run: cargo clean
  working-directory: ./app/src-tauri
```

#### 5. 权限问题

**问题**: GitHub token 权限不足

**解决方案**: 确保工作流有正确的权限配置
```yaml
permissions:
  contents: write  # 允许创建 release 和上传文件
```

### 调试技巧

#### 1. 启用调试构建

手动触发工作流时会额外运行调试构建 Job，生成调试版本用于测试：

```bash
# 调试版本会上传为 Artifact，保留 7 天
name: tauri-debug-macos
path: ./app/src-tauri/target/debug/bundle/
```

#### 2. 查看详细日志

在 GitHub Actions 页面查看详细的构建日志：

1. 访问仓库的 Actions 页面
2. 点击对应的工作流运行
3. 展开各个步骤查看详细输出

#### 3. 本地测试

在推送标签前，建议先在本地测试构建：

```bash
# 进入应用目录
cd app

# 安装依赖
npm ci

# 构建前端
npm run build

# 构建 Tauri 应用
npm run tauri:build
```

## 🔧 自定义配置

### 修改构建平台

如果只需要构建特定平台，可以修改构建矩阵：

```yaml
strategy:
  matrix:
    platform: [macos-latest]  # 只构建 macOS
    # platform: [ubuntu-20.04, windows-latest]  # 只构建 Linux 和 Windows
```

### 添加构建步骤

可以在构建前后添加自定义步骤：

```yaml
- name: Custom pre-build step
  run: echo "执行自定义构建前步骤"
  working-directory: ./app

# ... Tauri 构建步骤 ...

- name: Custom post-build step
  run: echo "执行自定义构建后步骤"
  working-directory: ./app
```

## 📚 相关资源

- [Tauri 官方文档](https://tauri.app/)
- [tauri-action GitHub](https://github.com/tauri-apps/tauri-action)
- [Tauri 配置指南](https://tauri.app/v1/guides/building/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

*最后更新：2024年12月19日*