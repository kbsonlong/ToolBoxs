<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { toolRoutes, getCategories, getToolsByCategory } from '@/router'
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
  DocumentChecked,
  ArrowRight,
  Tools,
  Star,
  TrendCharts
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
  DocumentChecked
}

// 获取所有分类
const categories = computed(() => getCategories())

// 根据分类获取工具
const getToolsInCategory = (category: string) => {
  return getToolsByCategory(category)
}

// 统计信息
const stats = computed(() => ({
  totalTools: toolRoutes.length,
  totalCategories: categories.value.length,
  features: ['免费使用', '无需注册', '数据安全', '响应式设计']
}))
</script>

<template>
  <div class="home-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <ElIcon class="hero-icon">
              <Tools />
            </ElIcon>
            实用工具集合平台
          </h1>
          <p class="hero-subtitle">
            一站式在线实用工具平台，提供{{ stats.totalTools }}个常用工具，
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
        </div>
      </div>
    </section>

    <ElDivider />

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
                      <ElButton type="primary" size="small" class="tool-button">
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
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
