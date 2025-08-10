<template>
  <div class="not-found-container">
    <el-result
      icon="warning"
      title="404"
      sub-title="抱歉，您访问的页面不存在"
    >
      <template #extra>
        <el-space direction="vertical" size="large">
          <el-button type="primary" @click="goHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
        </el-space>
      </template>
    </el-result>
    
    <div class="suggestions">
      <h3>您可能在寻找：</h3>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="8" v-for="tool in popularTools" :key="tool.name">
          <el-card class="tool-suggestion" shadow="hover" @click="goToTool(tool.path)">
            <div class="tool-info">
              <el-icon class="tool-icon" :size="24">
                <component :is="tool.icon" />
              </el-icon>
              <div class="tool-text">
                <h4>{{ tool.title }}</h4>
                <p>{{ tool.description }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { 
  House, 
  ArrowLeft, 
  Document, 
  Key, 
  DocumentCopy, 
  Clock,
  Lock,
  Grid
} from '@element-plus/icons-vue'

const router = useRouter()

// 热门工具推荐
const popularTools = [
  {
    name: 'base64',
    path: '/base64',
    title: 'Base64编码解码',
    description: 'Base64字符串编码和解码',
    icon: 'Document'
  },
  {
    name: 'json',
    path: '/json',
    title: 'JSON格式化',
    description: 'JSON格式化、验证和压缩',
    icon: 'DocumentCopy'
  },
  {
    name: 'time',
    path: '/time',
    title: '时间格式转换',
    description: '时间戳转换和格式化',
    icon: 'Clock'
  },
  {
    name: 'password',
    path: '/password',
    title: '密码生成器',
    description: '安全密码生成和强度检测',
    icon: 'Lock'
  },
  {
    name: 'qrcode',
    path: '/qrcode',
    title: 'QR码生成器',
    description: 'QR码生成和自定义',
    icon: 'Grid'
  },
  {
    name: 'md5',
    path: '/md5',
    title: 'MD5哈希计算',
    description: 'MD5哈希值计算和验证',
    icon: 'Key'
  }
]

/**
 * 返回首页
 */
const goHome = () => {
  router.push('/')
}

/**
 * 返回上一页
 */
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

/**
 * 跳转到指定工具
 * @param path 工具路径
 */
const goToTool = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.suggestions {
  margin-top: 3rem;
  max-width: 1200px;
  width: 100%;
}

.suggestions h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: #303133;
  font-size: 1.5rem;
  font-weight: 600;
}

.tool-suggestion {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  border-radius: 12px;
  overflow: hidden;
}

.tool-suggestion:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.tool-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tool-icon {
  color: #409eff;
  flex-shrink: 0;
}

.tool-text {
  flex: 1;
}

.tool-text h4 {
  margin: 0 0 0.5rem 0;
  color: #303133;
  font-size: 1.1rem;
  font-weight: 600;
}

.tool-text p {
  margin: 0;
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-container {
    padding: 1rem;
  }
  
  .suggestions {
    margin-top: 2rem;
  }
  
  .suggestions h3 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  
  .tool-info {
    gap: 0.75rem;
  }
  
  .tool-text h4 {
    font-size: 1rem;
  }
  
  .tool-text p {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .tool-info {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .tool-icon {
    align-self: center;
  }
}
</style>