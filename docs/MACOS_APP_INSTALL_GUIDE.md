# macOS 应用安装指南

## 问题描述

当您从 GitHub Releases 下载 macOS 版本的 Toolboxs 应用时，可能会遇到以下错误信息：

```
"Toolboxs"已损坏，无法打开。你应该推出磁盘映像。
```

## 问题原因

这个问题是由于 macOS 的 Gatekeeper 安全机制导致的。GitHub Action 构建的应用没有进行 Apple 官方代码签名，因此被 macOS 系统识别为"未知开发者"的应用。

## 解决方法

### 方法一：右键打开（推荐）

1. **下载应用**：从 GitHub Releases 页面下载 `.dmg` 文件
2. **双击挂载**：双击 `.dmg` 文件挂载磁盘映像
3. **右键点击应用**：在打开的窗口中，右键点击 `Toolboxs.app`
4. **选择打开**：从右键菜单中选择"打开"
5. **确认打开**：在弹出的安全警告对话框中点击"打开"
6. **拖拽到应用程序**：将应用拖拽到 Applications 文件夹（可选）

### 方法二：系统偏好设置

1. **尝试正常打开**：双击应用，会出现安全警告
2. **打开系统偏好设置**：前往 `系统偏好设置` > `安全性与隐私`
3. **允许应用运行**：在"通用"标签页中，点击"仍要打开"按钮
4. **确认打开**：在确认对话框中点击"打开"

### 方法三：终端命令（高级用户）

```bash
# 移除应用的隔离属性
sudo xattr -rd com.apple.quarantine /Applications/Toolboxs.app

# 或者针对下载的 DMG 文件
sudo xattr -rd com.apple.quarantine ~/Downloads/Toolboxs-*.dmg
```

## 安全说明

- ✅ **应用安全**：Toolboxs 是开源应用，代码完全透明，可在 GitHub 上查看
- ✅ **构建透明**：所有构建过程都在 GitHub Actions 中公开进行
- ✅ **无恶意代码**：应用不包含任何恶意代码或病毒
- ⚠️ **系统警告**：macOS 的警告是因为缺少 Apple 开发者签名，而非应用本身有问题

## 为什么不进行代码签名？

1. **成本考虑**：Apple 开发者账户需要每年支付 $99 美元
2. **开源性质**：作为开源项目，我们优先保证代码透明度
3. **用户选择**：用户可以自行编译或选择信任预构建版本

## 常见问题

### Q: 每次更新都需要重新"右键打开"吗？
A: 是的，每个新版本都需要重新进行一次"右键打开"操作。

### Q: 这样做安全吗？
A: 是的，只要您从官方 GitHub Releases 页面下载，应用是安全的。

### Q: 能否提供签名版本？
A: 目前暂无计划提供签名版本，但我们会在未来考虑这个选项。

### Q: 应用安装后在哪里？
A: 如果您将应用拖拽到了 Applications 文件夹，可以在 Launchpad 或 Applications 文件夹中找到。

## 技术细节

我们在构建配置中添加了以下设置来优化 macOS 兼容性：

```json
"mac": {
  "hardenedRuntime": true,
  "gatekeeperAssess": false
}
```

- `hardenedRuntime`: 启用强化运行时，提高应用安全性
- `gatekeeperAssess`: 跳过 Gatekeeper 自动评估，减少兼容性问题

## 反馈与支持

如果您在安装过程中遇到其他问题，请：

1. 查看 [GitHub Issues](https://github.com/your-username/toolboxs/issues)
2. 创建新的 Issue 描述您的问题
3. 提供您的 macOS 版本和错误截图

---

*最后更新：2024年12月19日*