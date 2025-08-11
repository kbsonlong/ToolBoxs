import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

/**
 * 路由配置
 * 使用查询参数模式：toolboxs?page=base64
 * 避免GitHub Pages多层级路径404问题
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'ToolBoxs 工具宝',
      description: 'ToolBoxs工具宝 - 一站式在线实用工具平台'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: '关于我们',
      description: '关于ToolBoxs工具宝平台'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: '页面未找到',
      description: '您访问的页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 路由切换时滚动到顶部
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 实用工具集合`
  } else {
    document.title = '实用工具集合'
  }
  
  // 设置页面描述
  if (to.meta?.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }
  
  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
  // 可以在这里添加错误上报逻辑
})

export default router

/**
 * 工具路由信息
 */
export const toolRoutes = [
  {
    name: 'base64',
    path: '/?page=base64',
    title: 'Base64编码解码',
    description: 'Base64字符串编码和解码',
    icon: 'Document',
    category: '编码转换'
  },
  {
    name: 'md5',
    path: '/?page=md5',
    title: 'MD5哈希计算',
    description: 'MD5哈希值计算和验证',
    icon: 'Key',
    category: '加密哈希'
  },
  {
    name: 'json',
    path: '/?page=json',
    title: 'JSON格式化',
    description: 'JSON格式化、验证和压缩',
    icon: 'DocumentCopy',
    category: '数据处理'
  },
  {
    name: 'time',
    path: '/?page=time',
    title: '时间格式转换',
    description: '时间戳转换和格式化',
    icon: 'Clock',
    category: '时间工具'
  },
  {
    name: 'password',
    path: '/?page=password',
    title: '密码生成器',
    description: '安全密码生成和强度检测',
    icon: 'Lock',
    category: '安全工具'
  },
  {
    name: 'qrcode',
    path: '/?page=qrcode',
    title: 'QR码生成器',
    description: 'QR码生成和自定义',
    icon: 'Grid',
    category: '生成工具'
  },
  {
    name: 'certificate',
    path: '/?page=certificate',
    title: 'TLS证书验证',
    description: 'TLS/SSL证书解析和验证',
    icon: 'Medal',
    category: '安全工具'
  },
  {
    name: 'certificate-parser',
    path: '/?page=certificate-parser',
    title: 'Base64证书解析',
    description: 'Base64编码证书解析',
    icon: 'DocumentChecked',
    category: '安全工具'
  }
]

/**
 * 根据分类获取工具
 * @param category 分类名称
 * @returns 工具列表
 */
export function getToolsByCategory(category?: string) {
  if (!category) {
    return toolRoutes
  }
  return toolRoutes.filter(tool => tool.category === category)
}

/**
 * 获取所有分类
 * @returns 分类列表
 */
export function getCategories() {
  const categories = [...new Set(toolRoutes.map(tool => tool.category))]
  return categories
}

/**
 * 根据名称获取工具信息
 * @param name 工具名称
 * @returns 工具信息
 */
export function getToolByName(name: string) {
  for (let i = 0; i < toolRoutes.length; i++) {
    if (toolRoutes[i].name === name) {
      return toolRoutes[i]
    }
  }
  return undefined
}
