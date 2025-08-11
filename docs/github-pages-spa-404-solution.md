# GitHub Pages SPA 多层级路径404问题解决方案

## 问题描述

当在GitHub Pages上部署单页应用(SPA)时，用户直接访问多层级路径（如 `/toolboxs/base64`、`/toolboxs/certificate` 等）或刷新页面时会出现404错误。这是因为GitHub Pages是静态文件托管服务，它会尝试在服务器上查找对应的物理文件，而SPA的路由是由前端JavaScript处理的。

## 问题原因

1. **静态文件服务器限制**：GitHub Pages只能提供静态文件，无法像传统服务器那样配置URL重写规则
2. **SPA路由机制**：Vue Router使用HTML5 History模式时，所有路由都应该指向同一个`index.html`文件
3. **直接访问子路径**：当用户直接访问`https://username.github.io/toolboxs/base64`时，GitHub Pages会查找`/toolboxs/base64/index.html`文件，但该文件不存在

## 解决方案

### 方案一：404.html重定向方案（推荐）

这是目前最优雅的解决方案，利用GitHub Pages的404.html机制：

#### 1. 创建404.html文件

在`public`目录下创建`404.html`文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>ToolBoxs 工具宝</title>
  <script type="text/javascript">
    // GitHub Pages SPA 路由重定向解决方案
    var pathSegmentsToKeep = 1;
    var l = window.location;
    
    // 将当前路径信息保存到URL参数中，然后重定向到index.html
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body>
  <div style="text-align: center; margin-top: 50px;">
    <h2>正在重定向...</h2>
    <p>如果页面没有自动跳转，请<a href="/toolboxs/">点击这里</a>返回首页</p>
  </div>
</body>
</html>
```

#### 2. 修改index.html

在`index.html`的`<head>`标签中添加处理重定向的脚本：

```html
<!-- GitHub Pages SPA 路由重定向处理脚本 -->
<script type="text/javascript">
  // 检查是否是从404页面重定向过来的
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
      }).join('?');
      // 使用history.replaceState来更新URL，不会触发页面重新加载
      window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

### 方案二：Hash路由模式

如果不想使用重定向方案，可以将Vue Router改为Hash模式：

```typescript
// router/index.ts
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL), // 使用Hash模式
  routes,
  // ...
})
```

**Hash模式的优缺点：**
- ✅ 优点：完全避免404问题，无需额外配置
- ❌ 缺点：URL中包含`#`符号，SEO不友好，用户体验略差

## 工作原理

### 404.html重定向方案工作流程：

1. **用户访问**：用户直接访问`https://username.github.io/toolboxs/base64`
2. **404触发**：GitHub Pages找不到对应文件，返回`404.html`
3. **路径保存**：404.html中的脚本将路径信息编码到URL参数中
4. **重定向**：重定向到`https://username.github.io/toolboxs/?/base64`
5. **路径恢复**：index.html中的脚本检测到重定向参数，恢复原始路径
6. **路由处理**：Vue Router正常处理恢复后的路径

## 注意事项

1. **BASE_URL配置**：确保Vite配置中的`base`路径与GitHub Pages仓库名一致
2. **pathSegmentsToKeep**：404.html中的`pathSegmentsToKeep`值应该根据你的部署路径调整
3. **SEO影响**：这种方案对SEO有轻微影响，因为搜索引擎可能会先看到404页面
4. **加载时间**：会有短暂的重定向过程，但用户体验影响很小

## 验证方法

部署后可以通过以下方式验证：

1. 直接在浏览器地址栏输入子路径URL
2. 在子页面刷新浏览器
3. 通过外部链接访问子页面
4. 检查浏览器开发者工具的Network面板，确认没有404错误

## 相关资源

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [Vue Router 官方文档](https://router.vuejs.org/)
- [SPA GitHub Pages 部署指南](https://github.com/rafgraph/spa-github-pages)

---

*文档创建时间：2024年12月19日*
*最后更新时间：2024年12月19日*