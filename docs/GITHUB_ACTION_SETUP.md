# GitHub Action 构建配置指南

## 概述

本文档说明如何正确配置 GitHub Action 来构建和发布 Electron 应用，解决 "GitHub Personal Access Token is not set" 的问题。

## 问题分析

根据 [electron-builder 官方文档](https://www.electron.build/publish.html#github-repository)，当检测到 `GH_TOKEN` 或 `GITHUB_TOKEN` 环境变量时，electron-builder 会自动尝试发布到 GitHub。但在我们的构建流程中：

1. 我们使用 `--publish=never` 参数明确禁止自动发布
2. 我们有独立的 release job 来处理发布流程
3. 这导致了配置冲突

## 解决方案

### 1. 环境变量控制

在所有 electron-builder 相关的构建步骤中，我们明确设置：

```yaml
env:
  GH_TOKEN: ""          # 明确设置为空，避免自动发布
  GITHUB_TOKEN: ""      # 明确设置为空，避免自动发布
```

### 2. 统一构建流程

使用矩阵策略支持多平台构建：

```yaml
strategy:
  matrix:
    os: [macos-latest, windows-latest, ubuntu-latest]
    include:
      - os: macos-latest
        platform: mac
        arch: arm64,x64
        ext: dmg
      - os: windows-latest
        platform: win
        arch: x64
        ext: exe
      - os: ubuntu-latest
        platform: linux
        arch: x64
        ext: AppImage
```

### 3. package.json 配置

在 `app/package.json` 中添加 publish 配置：

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "releaseType": "draft"
    }
  }
}
```

## 构建流程说明

### Build Job

1. **环境准备**：安装 Node.js 和依赖
2. **版本更新**：根据 tag 或手动输入更新版本号
3. **类型检查**：运行 TypeScript 类型检查
4. **构建应用**：使用统一的构建命令支持多平台
5. **上传制品**：将构建结果上传为 GitHub Artifacts

### Release Job

1. **下载制品**：从 build job 下载所有构建制品
2. **创建发布**：创建 GitHub Release
3. **上传资源**：使用 GitHub CLI 上传构建文件

## 使用方法

### 自动触发（推荐）

1. 创建并推送版本标签：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Action 会自动触发构建和发布流程

### 手动触发

1. 在 GitHub 仓库的 Actions 页面
2. 选择 "Build and Release Electron App" workflow
3. 点击 "Run workflow"
4. 输入版本号（如 v1.0.0）
5. 点击 "Run workflow" 按钮

## 注意事项

1. **GitHub Token**：GitHub Action 会自动提供 `GITHUB_TOKEN`，无需手动配置
2. **代码签名**：当前配置跳过了代码签名（`CSC_IDENTITY_AUTO_DISCOVERY: false`）
3. **发布权限**：确保 workflow 有 `contents: write` 权限
4. **仓库设置**：确保 `app/package.json` 中的 `repository` 字段正确设置

## 故障排除

### 构建失败

1. 检查 Node.js 版本是否匹配
2. 检查依赖是否正确安装
3. 查看构建日志中的具体错误信息

### 发布失败

1. 检查 GitHub Token 权限
2. 确认版本号格式正确
3. 检查制品是否正确生成

### Token 相关错误

如果仍然遇到 Token 相关错误：

1. 确认所有构建步骤都设置了空的 `GH_TOKEN` 和 `GITHUB_TOKEN`
2. 检查是否有其他地方设置了这些环境变量
3. 考虑在 repository secrets 中明确设置这些变量为空值

## 参考资料

- [electron-builder 发布文档](https://www.electron.build/publish.html)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitHub CLI 文档](https://cli.github.com/manual/)