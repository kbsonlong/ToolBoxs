# GitHub Action 配置指南

本指南详细说明了如何配置 GitHub Action 来自动构建和发布 Electron 应用。

## 新配置说明

### 使用 samuelmeuli/action-electron-builder

我们现在使用了专门的 `samuelmeuli/action-electron-builder` Action，这是一个成熟的 Electron 构建解决方案，具有以下优势：

- 🚀 **简化配置**: 自动处理构建和发布流程
- 🔧 **内置优化**: 针对 Electron 应用优化的构建流程
- 🌍 **跨平台支持**: 自动支持 macOS、Windows 和 Linux
- 📦 **自动发布**: 根据标签自动创建 GitHub Release

### 配置文件结构

```yaml
name: Build/release

on:
  push:
    tags:
      - 'v*.*.*'  # 当推送版本标签时触发
  workflow_dispatch:  # 允许手动触发

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v4

      - name: Install Node.js, NPM and Yarn
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: './app/package-lock.json'

      - name: Install dependencies
        run: npm ci
        working-directory: ./app
        env:
          CYPRESS_INSTALL_BINARY: 0

      - name: Update version from tag
        if: startsWith(github.ref, 'refs/tags/') || github.event_name == 'workflow_dispatch'
        run: |
          # 版本更新逻辑
        working-directory: ./app
        shell: bash

      - name: Type check
        run: npm run type-check
        working-directory: ./app

      - name: Build/release Electron app
        uses: samuelmeuli/action-electron-builder@v1
        with:
          github_token: ${{ secrets.github_token }}
          release: ${{ startsWith(github.ref, 'refs/tags/v') || github.event_name == 'workflow_dispatch' }}
          package_root: "./app"
          build_script_name: "build"
          skip_build: false
```

## 主要改进

### 1. 简化的构建流程

- **单一 Job**: 不再需要分离的构建和发布 Job
- **自动发布**: Action 自动处理 GitHub Release 创建
- **智能缓存**: 自动处理依赖缓存和构建缓存

### 2. 解决的问题

#### Token 问题解决
- ✅ 使用 `${{ secrets.github_token }}` (小写)
- ✅ Action 自动管理 token，无需手动配置
- ✅ 不再出现 "GitHub Personal Access Token is not set" 错误

#### 跨平台兼容性
- ✅ 自动处理不同操作系统的构建差异
- ✅ 统一的构建命令，无需平台特定逻辑
- ✅ 自动生成适合各平台的安装包

### 3. 支持的参数

- `package_root`: 包根目录 (默认: `".")`
- `build_script_name`: 构建脚本名称 (默认: `"build"`)
- `skip_build`: 是否跳过构建步骤
- `use_vue_cli`: 是否使用 Vue CLI 插件
- `args`: 传递给 electron-builder 的额外参数
- `max_attempts`: 最大重试次数

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

### 本地构建
```bash
# 在 app 目录下
npm run electron:build
```

## ⚠️ 常见问题解决

### 1. GitHub API 权限错误
如果遇到以下错误：
```
HTTP error 422
"x-accepted-github-permissions": "contents=write; contents=write,workflows=write"
```

**原因**: GitHub Action 缺少必要的权限来创建 release 和上传文件

**解决方案**: 已在 `electron-build.yml` 中添加权限配置：
```yaml
permissions:
  contents: write  # 允许创建 release 和上传文件
```

### 2. 发布类型冲突问题
如果遇到以下错误：
```
GitHub release not created reason=existing type not compatible with publishing type
existingType=release publishingType=draft
```

**原因**: GitHub 上已存在正式 release，但 electron-builder 尝试创建 draft release

**解决方案**: 已在 `package.json` 中配置：
```json
"publish": {
  "provider": "github",
  "releaseType": "release"
}
```

- `"releaseType": "release"`: 创建正式发布而非草稿，避免与现有 release 冲突

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

### Windows PowerShell 语法错误

**问题**: 在 Windows runner 中出现 `Missing '(' after 'if' in if statement` 错误

**原因**: Windows PowerShell 无法正确解析 bash 的单括号条件判断语法 `[ condition ]`

**解决方案**: 使用双括号语法 `[[ condition ]]` 并明确指定 `shell: bash`

**修复示例**:
```yaml
# 错误的写法
if [ "$condition" = "value" ]; then

# 正确的写法
if [[ "$condition" == "value" ]]; then
```

## 参考资料

- [electron-builder 发布文档](https://www.electron.build/publish.html)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitHub CLI 文档](https://cli.github.com/manual/)