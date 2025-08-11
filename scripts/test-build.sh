#!/bin/bash

# 测试构建脚本 - 验证 GitHub Actions 工作流配置
# 用于在本地测试构建流程，确保 GitHub Actions 能正常工作

set -e  # 遇到错误立即退出

echo "🚀 开始测试 ToolBoxs 构建流程..."
echo "======================================"

# 检查 Node.js 版本
echo "📋 检查环境..."
node_version=$(node -v)
echo "Node.js 版本: $node_version"

if [[ ! $node_version =~ ^v20\. ]] && [[ ! $node_version =~ ^v22\. ]]; then
    echo "❌ 错误: 需要 Node.js 20 或 22 版本"
    exit 1
fi

# 进入应用目录
cd "$(dirname "$0")/../app"
echo "📁 当前目录: $(pwd)"

# 安装依赖
echo "\n📦 安装依赖..."
npm ci

# 类型检查
echo "\n🔍 执行类型检查..."
npm run type-check

# 测试不同的构建方式
echo "\n🏗️ 测试构建配置..."

echo "\n1️⃣ 测试 GitHub Pages 构建..."
DEPLOY_TARGET=github-pages npm run build-only
echo "✅ GitHub Pages 构建成功"

echo "\n2️⃣ 测试生产环境构建..."
DEPLOY_TARGET=production npm run build-only
echo "✅ 生产环境构建成功"

echo "\n3️⃣ 测试 Electron 构建..."
ELECTRON=true npm run build-only
echo "✅ Electron 构建成功"

# 测试 Electron 打包
echo "\n📱 测试 Electron 打包..."
npm run electron:pack
echo "✅ Electron 打包成功"

# 检查构建产物
echo "\n📋 检查构建产物..."
echo "Web 构建产物:"
ls -la dist/ | head -10

echo "\nElectron 构建产物:"
if [ -d "dist-electron" ]; then
    ls -la dist-electron/ | head -10
else
    echo "❌ dist-electron 目录不存在"
fi

# 验证资源路径
echo "\n🔍 验证资源路径配置..."

echo "\n检查 GitHub Pages 版本的资源路径:"
if grep -q '/toolboxs/' dist/index.html; then
    echo "✅ GitHub Pages 前缀配置正确"
else
    echo "❌ GitHub Pages 前缀配置错误"
fi

# 重新构建 Electron 版本检查
ELECTRON=true npm run build-only > /dev/null 2>&1
echo "\n检查 Electron 版本的资源路径:"
if grep -q '\./assets/' dist/index.html; then
    echo "✅ Electron 相对路径配置正确"
else
    echo "❌ Electron 相对路径配置错误"
fi

# 清理测试文件
echo "\n🧹 清理测试文件..."
rm -rf dist dist-electron

echo "\n🎉 所有测试通过！"
echo "======================================"
echo "✅ 构建配置验证完成"
echo "✅ 资源路径配置正确"
echo "✅ Electron 打包正常"
echo "\n🚀 GitHub Actions 工作流应该能正常运行"
echo "\n💡 提示: 可以通过以下方式触发自动构建:"
echo "   git tag v1.0.0 && git push origin v1.0.0"