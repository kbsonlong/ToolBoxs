<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { toolRoutes, getCategories, getToolsByCategory } from '@/router'
import {
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElIcon,
  ElDrawer,
  ElButton
} from 'element-plus'
import {
  Menu as MenuIcon,
  Document,
  Key,
  DocumentCopy,
  Clock,
  Lock,
  Grid,
  Medal,
  Check,
  House,
  InfoFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const drawerVisible = ref(false)

// 图标映射
const iconMap = {
  Document,
  Key,
  DocumentCopy,
  Clock,
  Lock,
  Grid,
  Medal,
  Check,
  House,
  InfoFilled
}

// 获取所有分类
const categories = computed(() => getCategories())

// 根据分类获取工具
const getToolsInCategory = (category: string) => {
  return getToolsByCategory(category)
}

// 当前激活的菜单项
const activeIndex = computed(() => {
  return route.path
})

// 切换移动端菜单
const toggleMobileMenu = () => {
  drawerVisible.value = !drawerVisible.value
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  drawerVisible.value = false
}
</script>

<template>
  <nav class="app-navigation">
    <!-- 桌面端导航 -->
    <div class="desktop-nav">
      <div class="nav-brand">
        <RouterLink to="/" class="brand-link">
          <ElIcon size="24" color="#409eff">
            <House />
          </ElIcon>
          <span class="brand-text">实用工具集合</span>
        </RouterLink>
      </div>
      
      <ElMenu
        :default-active="activeIndex"
        mode="horizontal"
        class="nav-menu"
        router
      >
        <ElMenuItem index="/">
          <ElIcon><House /></ElIcon>
          <span>首页</span>
        </ElMenuItem>
        
        <ElSubMenu
          v-for="category in categories"
          :key="category"
          :index="category"
        >
          <template #title>
            <span>{{ category }}</span>
          </template>
          
          <ElMenuItem
            v-for="tool in getToolsInCategory(category)"
            :key="tool.name"
            :index="tool.path"
          >
            <ElIcon>
              <component :is="iconMap[tool.icon as keyof typeof iconMap]" />
            </ElIcon>
            <span>{{ tool.title }}</span>
          </ElMenuItem>
        </ElSubMenu>
        
        <ElMenuItem index="/about">
          <ElIcon><InfoFilled /></ElIcon>
          <span>关于</span>
        </ElMenuItem>
      </ElMenu>
    </div>
    
    <!-- 移动端导航 -->
    <div class="mobile-nav">
      <div class="mobile-header">
        <RouterLink to="/" class="mobile-brand">
          <ElIcon size="20" color="#409eff">
            <House />
          </ElIcon>
          <span>实用工具</span>
        </RouterLink>
        
        <ElButton
          type="text"
          @click="toggleMobileMenu"
          class="mobile-menu-btn"
        >
          <ElIcon size="20">
            <MenuIcon />
          </ElIcon>
        </ElButton>
      </div>
      
      <ElDrawer
        v-model="drawerVisible"
        title="导航菜单"
        direction="rtl"
        size="280px"
      >
        <ElMenu
          :default-active="activeIndex"
          mode="vertical"
          class="mobile-menu"
          router
          @select="closeMobileMenu"
        >
          <ElMenuItem index="/">
            <ElIcon><House /></ElIcon>
            <span>首页</span>
          </ElMenuItem>
          
          <ElSubMenu
            v-for="category in categories"
            :key="category"
            :index="category"
          >
            <template #title>
              <span>{{ category }}</span>
            </template>
            
            <ElMenuItem
              v-for="tool in getToolsInCategory(category)"
              :key="tool.name"
              :index="tool.path"
            >
              <ElIcon>
                <component :is="iconMap[tool.icon as keyof typeof iconMap]" />
              </ElIcon>
              <span>{{ tool.title }}</span>
            </ElMenuItem>
          </ElSubMenu>
          
          <ElMenuItem index="/about">
            <ElIcon><InfoFilled /></ElIcon>
            <span>关于</span>
          </ElMenuItem>
        </ElMenu>
      </ElDrawer>
    </div>
  </nav>
</template>

<style scoped>
.app-navigation {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 桌面端样式 */
.desktop-nav {
  display: flex;
  align-items: center;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-brand {
  margin-right: 40px;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #303133;
  font-weight: 600;
  font-size: 18px;
}

.brand-text {
  margin-left: 8px;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.nav-menu .el-menu-item,
.nav-menu .el-sub-menu__title {
  height: 60px;
  line-height: 60px;
}

/* 移动端样式 */
.mobile-nav {
  display: none;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  height: 60px;
}

.mobile-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #303133;
  font-weight: 600;
  font-size: 16px;
}

.mobile-brand span {
  margin-left: 6px;
}

.mobile-menu-btn {
  padding: 8px;
}

.mobile-menu {
  border-right: none;
}

.mobile-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-nav {
    display: block;
  }
}

/* 菜单项图标样式 */
.el-menu-item .el-icon,
.el-sub-menu__title .el-icon {
  margin-right: 8px;
}

/* 激活状态样式 */
.el-menu--horizontal .el-menu-item.is-active {
  border-bottom: 2px solid #409eff;
  color: #409eff;
}

/* 子菜单样式优化 */
.el-sub-menu .el-menu-item {
  padding-left: 40px !important;
}

.el-sub-menu .el-menu-item .el-icon {
  margin-right: 6px;
}
</style>