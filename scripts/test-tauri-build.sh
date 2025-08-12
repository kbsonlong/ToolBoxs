#!/bin/bash

# Tauri 构建测试脚本
# 用于验证 Tauri 构建环境和流程

set -e  # 遇到错误立即退出

echo "🚀 开始 Tauri 构建测试..."
echo "==========================================="

# 检查当前目录
if [ ! -f "app/package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📁 当前工作目录: $(pwd)"
echo "📦 进入应用目录: app/"
cd app

# 检查 Node.js 版本
echo "\n🔍 检查 Node.js 环境..."
node_version=$(node --version)
echo "✅ Node.js 版本: $node_version"

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

npm_version=$(npm --version)
echo "✅ npm 版本: $npm_version"

# 检查 Rust 环境
echo "\n🦀 检查 Rust 环境..."
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust 未安装，请先安装 Rust"
    echo "💡 安装命令: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

rust_version=$(rustc --version)
echo "✅ Rust 版本: $rust_version"

cargo_version=$(cargo --version)
echo "✅ Cargo 版本: $cargo_version"

# 检查 Rust 目标架构支持
echo "\n🎯 检查 Rust 目标架构支持..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🖥️  检查 macOS 多架构支持..."
    
    # 检查 x86_64-apple-darwin 目标
    if rustup target list --installed | grep -q "x86_64-apple-darwin"; then
        echo "✅ x86_64-apple-darwin 目标已安装"
    else
        echo "⚠️  x86_64-apple-darwin 目标未安装，正在安装..."
        rustup target add x86_64-apple-darwin
    fi
    
    # 检查 aarch64-apple-darwin 目标
    if rustup target list --installed | grep -q "aarch64-apple-darwin"; then
        echo "✅ aarch64-apple-darwin 目标已安装"
    else
        echo "⚠️  aarch64-apple-darwin 目标未安装，正在安装..."
        rustup target add aarch64-apple-darwin
    fi
    
    echo "✅ macOS 多架构支持已配置"
else
    echo "ℹ️  当前平台: $OSTYPE (非 macOS，跳过多架构检查)"
fi

# 检查 Tauri CLI
echo "\n🔧 检查 Tauri CLI..."
if ! npm list @tauri-apps/cli &> /dev/null; then
    echo "❌ Tauri CLI 未安装"
    echo "💡 安装命令: npm install @tauri-apps/cli"
    exit 1
fi

echo "✅ Tauri CLI 已安装"

# 检查依赖
echo "\n📦 检查项目依赖..."
if [ ! -d "node_modules" ]; then
    echo "📥 安装 npm 依赖..."
    npm ci
else
    echo "✅ npm 依赖已安装"
fi

# 检查 Tauri 配置
echo "\n⚙️  检查 Tauri 配置..."
if [ ! -f "src-tauri/tauri.conf.json" ]; then
    echo "❌ Tauri 配置文件不存在"
    exit 1
fi

echo "✅ Tauri 配置文件存在"

# 检查 Tauri 源码
if [ ! -f "src-tauri/src/main.rs" ]; then
    echo "❌ Tauri 主文件不存在"
    exit 1
fi

echo "✅ Tauri 源码文件存在"

# 类型检查
echo "\n🔍 执行类型检查..."
npm run type-check
echo "✅ 类型检查通过"

# 构建前端
echo "\n🏗️  构建前端应用..."
npm run build
echo "✅ 前端构建完成"

# 检查构建产物
if [ ! -d "dist" ]; then
    echo "❌ 前端构建产物不存在"
    exit 1
fi

echo "✅ 前端构建产物存在"

# Tauri 调试构建
echo "\n🔨 执行 Tauri 调试构建..."
echo "⏳ 这可能需要几分钟时间，请耐心等待..."

if npm run tauri:build:debug; then
    echo "✅ Tauri 调试构建成功"
else
    echo "❌ Tauri 调试构建失败"
    exit 1
fi

# 检查构建产物
echo "\n📋 检查构建产物..."
if [ -d "src-tauri/target/debug/bundle" ]; then
    echo "✅ 调试构建产物存在"
    echo "📁 构建产物位置: src-tauri/target/debug/bundle/"
    
    # 列出构建产物
    echo "\n📦 构建产物列表:"
    find src-tauri/target/debug/bundle -name "*.app" -o -name "*.dmg" -o -name "*.exe" -o -name "*.msi" -o -name "*.AppImage" -o -name "*.deb" 2>/dev/null || echo "未找到标准格式的构建产物"
else
    echo "❌ 调试构建产物不存在"
    exit 1
fi

# 测试完成
echo "\n🎉 Tauri 构建测试完成!"
echo "==========================================="
echo "✅ 所有检查都通过了"
echo "🚀 现在可以安全地使用 GitHub Actions 进行自动构建"
echo "\n💡 使用方法:"
echo "   1. 创建标签: git tag tauri-v1.0.0"
echo "   2. 推送标签: git push origin tauri-v1.0.0"
echo "   3. 查看 GitHub Actions 构建进度"
echo "\n🏗️  多架构构建支持:"
echo "   • macOS: 同时构建 Intel (x86_64) 和 Apple Silicon (ARM64) 版本"
echo "   • Windows: 构建 x86_64 版本"
echo "   • Linux: 构建 x86_64 版本"
echo "\n📚 更多信息请查看: docs/TAURI_GITHUB_ACTION_SETUP.md"