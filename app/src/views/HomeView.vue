<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { toolRoutes, getCategories, getToolsByCategory, getToolByName } from '@/router'
import { useToolStatsStore } from '@/stores/toolStats'

// 动态导入工具组件
import Base64View from './tools/Base64View.vue'
import MD5View from './tools/MD5View.vue'
import JSONView from './tools/JSONView.vue'
import TimeView from './tools/TimeView.vue'
import PasswordView from './tools/PasswordView.vue'
import QRCodeView from './tools/QRCodeView.vue'
import TLSCertView from './tools/TLSCertView.vue'
import Base64CertView from './tools/Base64CertView.vue'
import {
  ElRow,
  ElCol,
  ElCard,
  ElIcon,
  ElButton,
  ElDivider,
  ElTag
} from 'element-plus'
import {
  Document,
  Key,
  DocumentCopy,
  Clock,
  Lock,
  Grid,
  Medal,
  Check,
  ArrowRight,
  Tools,
  Star,
  TrendCharts,
  Trophy
} from '@element-plus/icons-vue'

// 图标映射
const iconMap = {
  Document,
  Key,
  DocumentCopy,
  Clock,
  Lock,
  Grid,
  Medal,
  Check
}

// 组件映射
const componentMap = {
  'base64': Base64View,
  'md5': MD5View,
  'json': JSONView,
  'time': TimeView,
  'password': PasswordView,
  'qrcode': QRCodeView,
  'certificate': TLSCertView,
  'tls-cert': TLSCertView,
  'base64-cert': Base64CertView,
  'certificate-parser': Base64CertView
}

// 使用路由
const route = useRoute()

// 当前显示的工具
const currentTool = ref<string | null>(null)
const currentComponent = ref<typeof componentMap[keyof typeof componentMap] | null>(null)

// 监听查询参数变化
watch(
  () => route.query.page,
  (newPage) => {
    if (newPage && typeof newPage === 'string' && componentMap[newPage as keyof typeof componentMap]) {
      currentTool.value = newPage
      currentComponent.value = componentMap[newPage as keyof typeof componentMap]
    } else {
      currentTool.value = null
      currentComponent.value = null
    }
  },
  { immediate: true }
)

// 使用工具统计store
const toolStatsStore = useToolStatsStore()

// 获取所有分类
const categories = computed(() => getCategories())

// 根据分类获取工具
const getToolsInCategory = (category: string) => {
  return getToolsByCategory(category)
}

// 获取常用工具（前3个）
const popularTools = toolStatsStore.getTopTools(3)

// 统计信息
const stats = computed(() => ({
  totalTools: toolRoutes.length,
  totalCategories: categories.value.length,
  totalClicks: toolStatsStore.totalClicks,
  features: ['免费使用', '无需注册', '数据安全', '响应式设计']
}))

// 处理工具点击
const handleToolClick = (toolPath: string) => {
  toolStatsStore.recordToolClick(toolPath)
}

// 获取当前工具信息
const currentToolInfo = computed(() => {
  if (currentTool.value) {
    return getToolByName(currentTool.value)
  }
  return null
})
</script>

<template>
  <div class="home-page">
    <!-- 当有查询参数page时，显示对应的工具组件 -->
    <div v-if="currentComponent && currentToolInfo" class="tool-page">
      <div class="tool-header">
        <div class="tool-breadcrumb">
          <RouterLink to="/" class="breadcrumb-link">首页</RouterLink>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ currentToolInfo.title }}</span>
        </div>
        <h1 class="tool-page-title">{{ currentToolInfo.title }}</h1>
        <p class="tool-page-description">{{ currentToolInfo.description }}</p>
      </div>
      <div class="tool-content">
        <component :is="currentComponent" />
      </div>
    </div>
    
    <!-- 默认显示工具列表 -->
    <div v-else>
      <!-- 英雄区域 -->
      <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <ElIcon class="hero-icon">
              <Tools />
            </ElIcon>
            ToolBoxs 工具宝
          </h1>
          <p class="hero-subtitle">
            ToolBoxs工具宝 - 一站式在线实用工具平台，提供{{ stats.totalTools }}个常用工具，
            涵盖{{ stats.totalCategories }}个分类，让您的工作更高效
          </p>
          <div class="hero-features">
            <ElTag
              v-for="feature in stats.features"
              :key="feature"
              type="success"
              effect="light"
              class="feature-tag"
            >
              <ElIcon><Star /></ElIcon>
              {{ feature }}
            </ElTag>
          </div>
          <div class="hero-actions">
            <ElButton type="primary" size="large" @click="$el.querySelector('.tools-section').scrollIntoView({ behavior: 'smooth' })">
               <ElIcon><ArrowRight /></ElIcon>
               开始使用
             </ElButton>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <ElIcon class="stat-icon">
              <Tools />
            </ElIcon>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalTools }}</div>
              <div class="stat-label">实用工具</div>
            </div>
          </div>
          <div class="stat-item">
            <ElIcon class="stat-icon">
              <TrendCharts />
            </ElIcon>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalCategories }}</div>
              <div class="stat-label">工具分类</div>
            </div>
          </div>
          <div class="stat-item">
            <ElIcon class="stat-icon">
              <Star />
            </ElIcon>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalClicks }}</div>
              <div class="stat-label">使用次数</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <ElDivider />

    <!-- 常用工具区域 -->
    <section class="popular-tools-section" v-if="popularTools.length > 0">
      <div class="section-header">
        <h2 class="section-title">
          <ElIcon class="section-icon">
            <Trophy />
          </ElIcon>
          常用工具
        </h2>
        <p class="section-subtitle">根据使用频率为您推荐的热门工具</p>
      </div>

      <ElRow :gutter="20" class="popular-tools-grid">
        <ElCol
          v-for="(tool, index) in popularTools"
          :key="tool.path"
          :xs="24"
          :sm="12"
          :md="8"
          class="popular-tool-col"
        >
          <ElCard class="popular-tool-card" shadow="hover">
            <div class="popular-tool-content">
              <div class="popular-tool-header">
                <div class="popular-tool-rank">
                  <ElIcon class="rank-icon" :class="`rank-${index + 1}`">
                    <Trophy />
                  </ElIcon>
                  <span class="rank-number">{{ index + 1 }}</span>
                </div>
                <ElIcon class="popular-tool-icon" size="32">
                  <component :is="iconMap[tool.icon as keyof typeof iconMap]" />
                </ElIcon>
              </div>
              <h4 class="popular-tool-title">{{ tool.title }}</h4>
              <p class="popular-tool-description">{{ tool.description }}</p>
              <div class="popular-tool-stats">
                <ElTag type="success" size="small">
                  使用次数: {{ tool.count }}
                </ElTag>
              </div>
              <div class="popular-tool-actions">
                <RouterLink :to="tool.path">
                  <ElButton 
                    type="primary" 
                    size="small" 
                    class="popular-tool-button"
                    @click="handleToolClick(tool.path)"
                  >
                    立即使用
                    <ElIcon><ArrowRight /></ElIcon>
                  </ElButton>
                </RouterLink>
              </div>
            </div>
          </ElCard>
        </ElCol>
      </ElRow>
    </section>

    <ElDivider v-if="popularTools.length > 0" />

    <!-- 工具展示区域 -->
    <section class="tools-section">
      <div class="section-header">
        <h2 class="section-title">工具分类</h2>
        <p class="section-subtitle">按分类浏览所有可用工具</p>
      </div>

      <div class="categories-container">
        <div
          v-for="category in categories"
          :key="category"
          class="category-section"
        >
          <h3 class="category-title">{{ category }}</h3>
          <ElRow :gutter="20" class="tools-grid">
            <ElCol
              v-for="tool in getToolsInCategory(category)"
              :key="tool.name"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              class="tool-col"
            >
              <ElCard class="tool-card" shadow="hover">
                <div class="tool-content">
                  <div class="tool-header">
                    <ElIcon class="tool-icon" size="32">
                      <component :is="iconMap[tool.icon as keyof typeof iconMap]" />
                    </ElIcon>
                    <h4 class="tool-title">{{ tool.title }}</h4>
                  </div>
                  <p class="tool-description">{{ tool.description }}</p>
                  <div class="tool-actions">
                    <RouterLink :to="tool.path">
                      <ElButton 
                        type="primary" 
                        size="small" 
                        class="tool-button"
                        @click="handleToolClick(tool.path)"
                      >
                         使用工具
                         <ElIcon><ArrowRight /></ElIcon>
                       </ElButton>
                    </RouterLink>
                  </div>
                </div>
              </ElCard>
            </ElCol>
          </ElRow>
        </div>
      </div>
    </section>

    <!-- 特性介绍区域 -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">平台特色</h2>
      </div>

      <ElRow :gutter="30" class="features-grid">
        <ElCol :xs="24" :sm="12" :md="6">
          <div class="feature-item">
            <ElIcon class="feature-icon" size="48">
              <Star />
            </ElIcon>
            <h4 class="feature-title">完全免费</h4>
            <p class="feature-desc">所有工具完全免费使用，无需付费订阅</p>
          </div>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="6">
          <div class="feature-item">
            <ElIcon class="feature-icon" size="48">
              <Lock />
            </ElIcon>
            <h4 class="feature-title">数据安全</h4>
            <p class="feature-desc">所有处理都在本地进行，保护您的数据隐私</p>
          </div>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="6">
          <div class="feature-item">
            <ElIcon class="feature-icon" size="48">
              <TrendCharts />
            </ElIcon>
            <h4 class="feature-title">响应式设计</h4>
            <p class="feature-desc">完美适配各种设备，随时随地使用</p>
          </div>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="6">
          <div class="feature-item">
            <ElIcon class="feature-icon" size="48">
              <Tools />
            </ElIcon>
            <h4 class="feature-title">持续更新</h4>
            <p class="feature-desc">定期添加新工具，不断完善用户体验</p>
          </div>
        </ElCol>
      </ElRow>
    </section>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 工具页面样式 */
.tool-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.tool-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
}

.tool-breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

.breadcrumb-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb-link:hover {
  color: white;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.6);
}

.breadcrumb-current {
  color: white;
  font-weight: 500;
}

.tool-page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tool-page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.tool-content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 英雄区域样式 */
.hero-section {
  padding: 80px 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  pointer-events: none;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.hero-icon {
  color: #ffd700;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 30px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-features {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.feature-tag {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
}

.hero-actions {
  margin-bottom: 60px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 40px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  color: #ffd700;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 常用工具区域样式 */
.popular-tools-section {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  margin-bottom: 40px;
}

.popular-tools-section .section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #e67e22;
}

.popular-tools-section .section-icon {
  color: #f39c12;
}

.popular-tools-grid {
  margin-top: 40px;
}

.popular-tool-col {
  margin-bottom: 20px;
}

.popular-tool-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.popular-tool-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 35px rgba(230, 126, 34, 0.2);
  border-color: #f39c12;
}

.popular-tool-content {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.popular-tool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.popular-tool-rank {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-icon {
  font-size: 20px;
}

.rank-icon.rank-1 {
  color: #f1c40f;
}

.rank-icon.rank-2 {
  color: #95a5a6;
}

.rank-icon.rank-3 {
  color: #e67e22;
}

.rank-number {
  font-weight: 700;
  font-size: 1.2rem;
  color: #2c3e50;
}

.popular-tool-icon {
  color: #e67e22;
}

.popular-tool-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.popular-tool-description {
  color: #7f8c8d;
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
}

.popular-tool-stats {
  margin-bottom: 20px;
}

.popular-tool-actions {
  margin-top: auto;
}

.popular-tool-button {
  width: 100%;
  border-radius: 10px;
  background: linear-gradient(135deg, #e67e22 0%, #f39c12 100%);
  border: none;
  font-weight: 600;
}

.popular-tool-button:hover {
  background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
}

/* 工具展示区域样式 */
.tools-section {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 0;
}

.categories-container {
  margin-top: 40px;
}

.category-section {
  margin-bottom: 50px;
}

.category-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 24px;
  padding-left: 16px;
  border-left: 4px solid #3498db;
}

.tools-grid {
  margin-bottom: 40px;
}

.tool-col {
  margin-bottom: 20px;
}

.tool-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.tool-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tool-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.tool-icon {
  color: #3498db;
  margin-right: 12px;
}

.tool-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.tool-description {
  color: #7f8c8d;
  line-height: 1.5;
  margin-bottom: 20px;
  flex: 1;
}

.tool-actions {
  margin-top: auto;
}

.tool-button {
  width: 100%;
  border-radius: 8px;
}

/* 特性介绍区域样式 */
.features-section {
  padding: 80px 20px;
  background: #f8f9fa;
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-item {
  text-align: center;
  padding: 30px 20px;
}

.feature-icon {
  color: #3498db;
  margin-bottom: 20px;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.feature-desc {
  color: #7f8c8d;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 8px;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 30px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .hero-features {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 16px;
  }
  
  .tools-section,
  .features-section {
    padding: 60px 16px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
}
</style>
