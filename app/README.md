# ToolBoxs 工具宝

ToolBoxs工具宝 - 一个基于Vue.js 3的现代化实用工具集合，提供8个常用的开发和管理工具。每个工具都有独立的URL，支持移动端访问，界面简洁易用。

## 📱 多平台支持

- **Web版本**: 在浏览器中直接使用
- **桌面应用**: 支持macOS DMG安装包
- **移动端**: 响应式设计，完美适配手机和平板
- **调试模式**: 支持生产环境调试，便于问题排查

## 🚀 功能特性

### 核心工具

1. **Base64编解码工具** (`/base64`)
   - 支持文本与Base64格式的双向转换
   - 实时编码/解码，无需点击按钮
   - 自动检测输入格式并提供相应转换
   - 错误提示和输入验证

2. **MD5加密工具** (`/md5`)
   - 生成文本的MD5哈希值
   - 支持空字符串加密
   - 实时计算，输入即显示结果
   - 适用于数据完整性验证

3. **JSON格式化工具** (`/json`)
   - JSON格式化和美化显示
   - JSON压缩功能
   - 语法错误检测和行号提示
   - 支持大型JSON文件处理

4. **时间格式化工具** (`/time`)
   - Unix时间戳与人类可读时间的双向转换
   - 支持多种时区转换
   - 实时时间显示
   - 时间格式验证

5. **密码生成器** (`/password`)
   - 生成安全的随机密码
   - 可配置密码长度(8-128位)
   - 支持字符类型选择(大写、小写、数字、符号)
   - 批量生成多个密码

6. **二维码生成器** (`/qrcode`)
   - 文本/URL转二维码
   - 可调节二维码尺寸
   - 支持不同容错级别
   - 二维码图片下载功能

7. **TLS证书验证器** (`/tls`)
   - 解析和验证TLS证书
   - 显示证书详细信息(颁发者、主题、有效期等)
   - 过期警告提示
   - 证书指纹计算

8. **Base64证书解析器** (`/cert-parser`)
   - 解码Base64编码的TLS证书
   - 自动解析证书内容
   - 与TLS验证器相同的详细信息显示
   - 双重错误处理(Base64解码 + 证书解析)

### 技术特性

- 🎯 **单页应用(SPA)**: 基于Vue.js 3 + TypeScript
- 🛣️ **独立URL**: 每个工具都有唯一的访问路径
- 📱 **移动端友好**: 响应式设计，完美适配各种设备
- ⚡ **实时处理**: 输入即时显示结果，无需等待
- 🎨 **现代UI**: 基于Element Plus的美观界面
- 🔒 **客户端处理**: 所有数据在本地处理，保护隐私
- 📋 **一键复制**: 所有结果都支持复制到剪贴板
- 🚫 **错误处理**: 完善的输入验证和错误提示
- 🏆 **常用工具推荐**: 基于使用频率智能推荐最常用的工具
- 📊 **使用统计**: 记录工具使用次数，数据本地存储

### 常用工具功能

主页会根据您的使用习惯，自动显示点击次数最多的前3个工具：

- **智能推荐**: 根据历史使用数据推荐最常用工具
- **使用统计**: 显示每个工具的使用次数
- **本地存储**: 统计数据保存在浏览器本地，保护隐私
- **排行榜显示**: 以奖杯图标和排名展示热门工具
- **快速访问**: 一键直达最常用的工具页面

## 🛠️ 技术栈

- **前端框架**: Vue.js 3 (Composition API)
- **开发语言**: TypeScript
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **UI组件库**: Element Plus
- **构建工具**: Vite
- **测试框架**: Vitest + Cypress
- **代码规范**: ESLint + Prettier

### 核心依赖

- `crypto-js`: MD5加密功能
- `qrcode`: 二维码生成
- `node-forge`: TLS证书解析
- `@element-plus/icons-vue`: 图标库

## 📦 安装和运行

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 生产构建

项目支持多种构建方式，根据不同的部署场景自动配置正确的资源路径：

#### GitHub Pages 构建
```bash
npm run build:github
```
使用 `/toolboxs/` 前缀，适用于 GitHub Pages 部署。

#### 生产环境构建
```bash
npm run build:production
```
使用 `/` 根路径，适用于服务器根目录部署。

#### Electron 应用构建
```bash
npm run build:electron
```
使用相对路径 `./`，适用于桌面应用打包。

#### 默认构建（兼容性）
```bash
npm run build
```
等同于 `npm run build:github`，保持向后兼容。

> 📖 **详细说明**：查看 [构建配置指南](./BUILD_CONFIGURATION_GUIDE.md) 了解更多构建配置的技术细节。
> 
> 🔧 **性能优化**：查看 [构建优化指南](./BUILD_OPTIMIZATION_GUIDE.md) 了解如何优化构建性能和解决常见问题。

### 预览生产版本

```bash
npm run preview
```

## 🚀 部署

### GitHub Pages 自动部署

本项目已配置 GitHub Actions 自动部署到 GitHub Pages。当代码推送到 `main` 分支时，会自动触发构建和部署流程。

#### 部署步骤：

1. **启用 GitHub Pages**：
   - 进入 GitHub 仓库设置页面
   - 找到 "Pages" 选项
   - 在 "Source" 中选择 "GitHub Actions"

2. **推送代码**：
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

3. **查看部署状态**：
   - 在 GitHub 仓库的 "Actions" 标签页查看构建状态
   - 部署成功后，可通过 `https://[username].github.io/toolboxs/` 访问

#### 本地构建测试：

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🧪 测试

### 单元测试

```bash
npm run test:unit
```

### 端到端测试

```bash
npm run test:e2e
```

### 测试覆盖率

```bash
npm run test:unit -- --coverage
```

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── layout/         # 布局组件
│   │   ├── AppHeader.vue
│   │   ├── AppNavigation.vue
│   │   └── AppFooter.vue
│   └── tools/          # 工具组件
│       ├── Base64Tool.vue
│       ├── MD5Tool.vue
│       ├── JsonFormatter.vue
│       ├── TimeFormatter.vue
│       ├── PasswordGenerator.vue
│       ├── QRCodeGenerator.vue
│       ├── TLSValidator.vue
│       └── Base64CertParser.vue
├── services/           # 业务服务
│   ├── cryptoService.ts
│   ├── timeService.ts
│   ├── qrService.ts
│   └── certService.ts
├── utils/              # 工具函数
│   ├── validators.ts
│   └── formatters.ts
├── router/             # 路由配置
│   └── index.ts
├── stores/             # 状态管理
├── styles/             # 样式文件
│   ├── main.css
│   └── responsive.css
├── App.vue             # 根组件
└── main.ts             # 入口文件
```

## 🌐 路由说明

| 路径 | 组件 | 功能描述 |
|------|------|----------|
| `/` | 重定向到 `/base64` | 默认页面 |
| `/base64` | Base64Tool | Base64编解码 |
| `/md5` | MD5Tool | MD5加密 |
| `/json` | JsonFormatter | JSON格式化 |
| `/time` | TimeFormatter | 时间格式转换 |
| `/password` | PasswordGenerator | 密码生成 |
| `/qrcode` | QRCodeGenerator | 二维码生成 |
| `/tls` | TLSValidator | TLS证书验证 |
| `/cert-parser` | Base64CertParser | Base64证书解析 |

## 🎯 使用指南

### Base64工具使用

1. 访问 `/base64` 路径
2. 在"编码"区域输入普通文本，自动显示Base64编码结果
3. 在"解码"区域输入Base64文本，自动显示解码结果
4. 点击复制按钮将结果复制到剪贴板

### 密码生成器使用

1. 访问 `/password` 路径
2. 设置密码长度(8-128位)
3. 选择包含的字符类型
4. 设置生成数量
5. 点击生成按钮获取密码

### 二维码生成器使用

1. 访问 `/qrcode` 路径
2. 输入要转换的文本或URL
3. 调整二维码尺寸和容错级别
4. 点击下载按钮保存二维码图片

## 🔧 配置说明

### Vite配置

项目使用Vite作为构建工具，配置文件为 `vite.config.ts`。主要配置包括：

- Vue插件配置
- 路径别名设置
- 开发服务器配置
- 构建优化配置

### TypeScript配置

项目使用TypeScript进行开发，配置文件包括：

- `tsconfig.json`: 主配置文件
- `tsconfig.app.json`: 应用配置
- `tsconfig.node.json`: Node.js配置
- `tsconfig.vitest.json`: 测试配置

## 🖥️ 桌面应用开发

### Electron开发环境

启动Electron开发环境：

```bash
npm run electron:dev
```

这将同时启动Vite开发服务器和Electron应用。

### 构建桌面应用

#### 构建应用包（不生成安装包）

```bash
npm run electron:pack
```

#### 生成macOS DMG安装包

```bash
npm run electron:build
# 或者
npm run electron:dist
```

生成的DMG文件位于 `dist-electron/` 目录下。

### Electron配置

- **主进程文件**: `electron/main.js`
- **构建配置**: `package.json` 中的 `build` 字段
- **支持平台**: macOS (DMG), Windows (NSIS), Linux (AppImage)

### 桌面应用特性

- 原生窗口体验
- 自动端口检测
- 开发者工具集成
- 多平台支持（macOS、Windows、Linux）
- 自动更新支持

### 🚀 自动发布流程

项目配置了 GitHub Actions 自动构建和发布流程：

#### 版本发布
```bash
# 创建版本标签
git tag v1.0.0

# 推送标签触发自动构建
git push origin v1.0.0
```

#### 构建产物
- **macOS**: Universal DMG（支持 Intel + Apple Silicon）
- **Windows**: NSIS 安装程序（.exe）
- **Linux**: AppImage 便携应用

#### 手动触发
也可以在 GitHub Actions 页面手动触发构建流程。

> 📖 **详细说明**：查看 [发布指南](../docs/RELEASE_GUIDE.md) 了解完整的发布流程。


### 调试模式

如果打包后的应用出现空白页面或其他问题，可以启用调试模式：

```bash
# 启动调试模式（自动打开开发者工具）
npm run electron:debug

# 重新打包并启动调试模式
npm run electron:pack-debug

# 使用环境变量启动
DEBUG=true open dist-electron/mac-arm64/Toolboxs.app

# 使用启动脚本
./start-debug.sh
```

详细的调试指南请参考 [ELECTRON_DEBUG_GUIDE.md](ELECTRON_DEBUG_GUIDE.md)

## 🚀 部署

### 静态部署

构建完成后，`dist` 目录包含所有静态文件，可以部署到任何静态网站托管服务：

- Netlify
- Vercel
- GitHub Pages
- 阿里云OSS
- 腾讯云COS

### Docker部署

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- Vue.js 团队提供的优秀框架
- Element Plus 提供的UI组件库
- 所有开源库的贡献者们

---

**注意**: 所有工具都在客户端本地运行，不会向服务器发送任何数据，确保您的隐私和数据安全。
