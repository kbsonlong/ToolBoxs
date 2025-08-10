import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

/**
 * 路由配置
 * 为每个工具提供独立的URL路径
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: '实用工具集合',
      description: '一站式在线实用工具平台'
    }
  },
  {
    path: '/base64',
    name: 'base64',
    component: () => import('../views/tools/Base64View.vue'),
    meta: {
      title: 'Base64编码解码',
      description: 'Base64字符串编码和解码工具'
    }
  },
  {
    path: '/md5',
    name: 'md5',
    component: () => import('../views/tools/MD5View.vue'),
    meta: {
      title: 'MD5哈希计算',
      description: 'MD5哈希值计算和验证工具'
    }
  },
  {
    path: '/json',
    name: 'json',
    component: () => import('../views/tools/JSONView.vue'),
    meta: {
      title: 'JSON格式化',
      description: 'JSON格式化、验证和压缩工具'
    }
  },
  {
    path: '/time',
    name: 'time',
    component: () => import('../views/tools/TimeView.vue'),
    meta: {
      title: '时间格式转换',
      description: '时间戳转换和时间格式化工具'
    }
  },
  {
    path: '/password',
    name: 'password',
    component: () => import('../views/tools/PasswordView.vue'),
    meta: {
      title: '密码生成器',
      description: '安全密码生成和强度检测工具'
    }
  },
  {
    path: '/qrcode',
    name: 'qrcode',
    component: () => import('../views/tools/QRCodeView.vue'),
    meta: {
      title: 'QR码生成器',
      description: 'QR码生成和自定义工具'
    }
  },
  {
    path: '/certificate',
    name: 'certificate',
    component: () => import('../views/tools/TLSCertView.vue'),
    meta: {
      title: 'TLS证书验证',
      description: 'TLS/SSL证书解析和验证工具'
    }
  },
  {
    path: '/certificate-parser',
    name: 'certificate-parser',
    component: () => import('../views/tools/Base64CertView.vue'),
    meta: {
      title: 'Base64证书解析',
      description: 'Base64编码证书解析工具'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: '关于我们',
      description: '关于实用工具集合平台'
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
    path: '/base64',
    title: 'Base64编码解码',
    description: 'Base64字符串编码和解码',
    icon: 'Document',
    category: '编码转换'
  },
  {
    name: 'md5',
    path: '/md5',
    title: 'MD5哈希计算',
    description: 'MD5哈希值计算和验证',
    icon: 'Key',
    category: '加密哈希'
  },
  {
    name: 'json',
    path: '/json',
    title: 'JSON格式化',
    description: 'JSON格式化、验证和压缩',
    icon: 'DocumentCopy',
    category: '数据处理'
  },
  {
    name: 'time',
    path: '/time',
    title: '时间格式转换',
    description: '时间戳转换和格式化',
    icon: 'Clock',
    category: '时间工具'
  },
  {
    name: 'password',
    path: '/password',
    title: '密码生成器',
    description: '安全密码生成和强度检测',
    icon: 'Lock',
    category: '安全工具'
  },
  {
    name: 'qrcode',
    path: '/qrcode',
    title: 'QR码生成器',
    description: 'QR码生成和自定义',
    icon: 'Grid',
    category: '生成工具'
  },
  {
    name: 'certificate',
    path: '/certificate',
    title: 'TLS证书验证',
    description: 'TLS/SSL证书解析和验证',
    icon: 'Medal',
    category: '安全工具'
  },
  {
    name: 'certificate-parser',
    path: '/certificate-parser',
    title: 'Base64证书解析',
    description: 'Base64编码证书解析',
    icon: 'DocumentChecked',
    category: '安全工具'
  }
] as const

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
  return toolRoutes.find(tool => tool.name === name)
}
