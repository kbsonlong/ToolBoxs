<template>
  <div class="tool-container">
    <div class="tool-header">
      <h1>
        <el-icon><DocumentCopy /></el-icon>
        JSON格式化
      </h1>
      <p>JSON格式化、验证、压缩和美化工具</p>
    </div>

    <el-card class="tool-content">
      <div class="json-tools">
        <div class="input-section">
          <div class="section-header">
            <h3>JSON输入</h3>
            <el-space>
              <el-button @click="formatJSON" type="primary" :icon="Star">
                格式化
              </el-button>
              <el-button @click="minifyJSON" :icon="Fold">
                压缩
              </el-button>
              <el-button @click="validateJSONAction" :icon="Check">
                验证
              </el-button>
              <el-button @click="clearInput" :icon="Delete">
                清空
              </el-button>
              <el-button @click="loadSample" :icon="DocumentAdd">
                示例
              </el-button>
            </el-space>
          </div>
          
          <el-input
            v-model="inputJSON"
            type="textarea"
            placeholder="请输入JSON字符串..."
            :rows="12"
            resize="vertical"
            show-word-limit
            maxlength="100000"
            @input="handleInput"
          />
          
          <div class="input-info">
            <el-space>
              <el-text size="small" type="info">
                字符数: {{ inputJSON.length }}
              </el-text>
              <el-text size="small" type="info">
                行数: {{ inputLines }}
              </el-text>
              <el-text size="small" :type="validationStatus.type">
                {{ validationStatus.message }}
              </el-text>
            </el-space>
          </div>
        </div>

        <div class="output-section">
          <div class="section-header">
            <h3>格式化结果</h3>
            <el-space>
              <el-select v-model="indentSize" placeholder="缩进" style="width: 120px">
                <el-option label="2空格" :value="2" />
                <el-option label="4空格" :value="4" />
                <el-option label="Tab" value="\t" />
              </el-select>
              <el-button @click="copyResult" :icon="DocumentCopy" :disabled="!outputJSON">
                复制结果
              </el-button>
              <el-button @click="downloadResult" :icon="Download" :disabled="!outputJSON">
                下载JSON
              </el-button>
              <el-button @click="swapContent" :icon="Switch" :disabled="!outputJSON">
                交换
              </el-button>
            </el-space>
          </div>
          
          <el-input
            v-model="outputJSON"
            type="textarea"
            placeholder="格式化后的JSON将显示在这里..."
            :rows="12"
            resize="vertical"
            readonly
          />
          
          <div class="output-info" v-if="outputJSON">
            <el-space>
              <el-text size="small" type="success">
                输出字符数: {{ outputJSON.length }}
              </el-text>
              <el-text size="small" type="success">
                输出行数: {{ outputLines }}
              </el-text>
              <el-text size="small" type="info">
                压缩率: {{ compressionRatio }}%
              </el-text>
            </el-space>
          </div>
        </div>
      </div>

      <!-- JSON分析 -->
      <div class="json-analysis" v-if="jsonStats">
        <el-divider content-position="left">
          <h3>JSON分析</h3>
        </el-divider>
        
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-label">对象数量</div>
                <div class="stat-value">{{ jsonStats.objects }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-label">数组数量</div>
                <div class="stat-value">{{ jsonStats.arrays }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-label">字符串数量</div>
                <div class="stat-value">{{ jsonStats.strings }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-label">数字数量</div>
                <div class="stat-value">{{ jsonStats.numbers }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-label">布尔值数量</div>
                <div class="stat-value">{{ jsonStats.booleans }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-label">null值数量</div>
                <div class="stat-value">{{ jsonStats.nulls }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="depth-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="最大深度">{{ jsonStats.maxDepth }}</el-descriptions-item>
            <el-descriptions-item label="总键数量">{{ jsonStats.totalKeys }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{ formatFileSize(new Blob([inputJSON]).size) }}</el-descriptions-item>
            <el-descriptions-item label="格式化后大小">{{ formatFileSize(new Blob([outputJSON]).size) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- 错误信息 -->
      <div class="error-section" v-if="errorInfo">
        <el-divider content-position="left">
          <h3>错误信息</h3>
        </el-divider>
        
        <el-alert
          :title="errorInfo.title"
          type="error"
          :description="errorInfo.description"
          show-icon
          :closable="false"
        />
        
        <div class="error-details" v-if="errorInfo.details">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="错误位置">第 {{ errorInfo.details.line }} 行，第 {{ errorInfo.details.column }} 列</el-descriptions-item>
            <el-descriptions-item label="错误类型">{{ errorInfo.details.type }}</el-descriptions-item>
            <el-descriptions-item label="建议修复">{{ errorInfo.details.suggestion }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DocumentCopy,
  Download,
  Delete,
  DocumentAdd,
  Switch,
  Star,
  Fold,
  Check
} from '@element-plus/icons-vue'
import { formatJSON as formatJSONUtil, minifyJSON as minifyJSONUtil } from '@/utils/formatters'
import { formatFileSize } from '@/utils/formatters'

// 响应式数据
const inputJSON = ref('')
const outputJSON = ref('')
const indentSize = ref<number>(2)
const errorInfo = ref<{
  title: string
  description: string
  details?: {
    line: number
    column: number
    type: string
    suggestion: string
  }
} | null>(null)

// 计算属性
const inputLines = computed(() => {
  return inputJSON.value.split('\n').length
})

const outputLines = computed(() => {
  return outputJSON.value.split('\n').length
})

const compressionRatio = computed(() => {
  if (!inputJSON.value || !outputJSON.value) return 0
  return Math.round((outputJSON.value.length / inputJSON.value.length) * 100)
})

const validationStatus = computed(() => {
  if (!inputJSON.value.trim()) {
    return { type: 'info', message: '请输入JSON字符串' }
  }
  
  try {
    JSON.parse(inputJSON.value)
    return { type: 'success', message: '✓ JSON格式正确' }
  } catch {
    return { type: 'danger', message: '✗ JSON格式错误' }
  }
})

const jsonStats = computed(() => {
  if (!inputJSON.value.trim()) return null
  
  try {
    const parsed = JSON.parse(inputJSON.value)
    return analyzeJSON(parsed)
  } catch {
    return null
  }
})

// 监听器
watch(indentSize, () => {
  if (outputJSON.value) {
    formatJSON()
  }
})

/**
 * 处理输入变化
 */
const handleInput = () => {
  errorInfo.value = null
  
  if (!inputJSON.value.trim()) {
    outputJSON.value = ''
    return
  }
  
  // 实时验证
  try {
    JSON.parse(inputJSON.value)
  } catch (error: any) {
    const errorMatch = error.message.match(/at position (\d+)/)
    if (errorMatch) {
      const position = parseInt(errorMatch[1])
      const lines = inputJSON.value.substring(0, position).split('\n')
      const line = lines.length
      const column = lines[lines.length - 1].length + 1
      
      errorInfo.value = {
        title: 'JSON语法错误',
        description: error.message,
        details: {
          line,
          column,
          type: '语法错误',
          suggestion: '请检查JSON语法，确保所有括号、引号和逗号正确匹配'
        }
      }
    } else {
      errorInfo.value = {
        title: 'JSON格式错误',
        description: error.message
      }
    }
  }
}

/**
 * 格式化JSON
 */
const formatJSON = () => {
  if (!inputJSON.value.trim()) {
    ElMessage.warning('请输入JSON字符串')
    return
  }
  
  try {
    outputJSON.value = formatJSONUtil(inputJSON.value, indentSize.value)
    errorInfo.value = null
    ElMessage.success('JSON格式化成功')
  } catch (error) {
    console.error('格式化失败:', error)
    ElMessage.error('JSON格式化失败，请检查输入格式')
  }
}

/**
 * 压缩JSON
 */
const minifyJSON = () => {
  if (!inputJSON.value.trim()) {
    ElMessage.warning('请输入JSON字符串')
    return
  }
  
  try {
    outputJSON.value = minifyJSONUtil(inputJSON.value)
    errorInfo.value = null
    ElMessage.success('JSON压缩成功')
  } catch (error) {
    console.error('压缩失败:', error)
    ElMessage.error('JSON压缩失败，请检查输入格式')
  }
}

/**
 * 验证JSON
 */
const validateJSONAction = () => {
  if (!inputJSON.value.trim()) {
    ElMessage.warning('请输入JSON字符串')
    return
  }
  
  try {
    JSON.parse(inputJSON.value)
    ElMessage.success('JSON格式正确')
    errorInfo.value = null
  } catch {
    ElMessage.error('JSON格式错误')
    handleInput() // 更新错误信息
  }
}

/**
 * 清空输入
 */
const clearInput = () => {
  inputJSON.value = ''
  outputJSON.value = ''
  errorInfo.value = null
}

/**
 * 加载示例JSON
 */
const loadSample = () => {
  inputJSON.value = `{
  "name": "张三",
  "age": 30,
  "city": "北京",
  "hobbies": ["读书", "游泳", "编程"],
  "address": {
    "street": "中关村大街",
    "number": 123,
    "zipcode": "100080"
  },
  "married": true,
  "children": null,
  "score": 95.5
}`
}

/**
 * 复制结果
 */
const copyResult = async () => {
  if (!outputJSON.value) return
  
  try {
    await navigator.clipboard.writeText(outputJSON.value)
    ElMessage.success('复制成功')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

/**
 * 下载结果
 */
const downloadResult = () => {
  if (!outputJSON.value) return
  
  const blob = new Blob([outputJSON.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'formatted.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('下载成功')
}

/**
 * 交换输入输出内容
 */
const swapContent = () => {
  if (!outputJSON.value) return
  
  const temp = inputJSON.value
  inputJSON.value = outputJSON.value
  outputJSON.value = temp
}

/**
 * 分析JSON结构
 */
const analyzeJSON = (obj: any, depth = 0): {
  objects: number
  arrays: number
  strings: number
  numbers: number
  booleans: number
  nulls: number
  maxDepth: number
  totalKeys: number
} => {
  const stats = {
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    maxDepth: depth,
    totalKeys: 0
  }
  
  if (obj === null) {
    stats.nulls++
  } else if (typeof obj === 'boolean') {
    stats.booleans++
  } else if (typeof obj === 'number') {
    stats.numbers++
  } else if (typeof obj === 'string') {
    stats.strings++
  } else if (Array.isArray(obj)) {
    stats.arrays++
    obj.forEach(item => {
      const childStats = analyzeJSON(item, depth + 1)
      stats.objects += childStats.objects
      stats.arrays += childStats.arrays
      stats.strings += childStats.strings
      stats.numbers += childStats.numbers
      stats.booleans += childStats.booleans
      stats.nulls += childStats.nulls
      stats.maxDepth = Math.max(stats.maxDepth, childStats.maxDepth)
      stats.totalKeys += childStats.totalKeys
    })
  } else if (typeof obj === 'object') {
    stats.objects++
    const keys = Object.keys(obj)
    stats.totalKeys += keys.length
    
    keys.forEach(key => {
      const childStats = analyzeJSON(obj[key], depth + 1)
      stats.objects += childStats.objects
      stats.arrays += childStats.arrays
      stats.strings += childStats.strings
      stats.numbers += childStats.numbers
      stats.booleans += childStats.booleans
      stats.nulls += childStats.nulls
      stats.maxDepth = Math.max(stats.maxDepth, childStats.maxDepth)
      stats.totalKeys += childStats.totalKeys
    })
  }
  
  return stats
}
</script>

<style scoped>
.tool-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.tool-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 2rem;
  font-weight: 600;
}

.tool-header p {
  color: #606266;
  font-size: 1.1rem;
  margin: 0;
}

.tool-content {
  border-radius: 12px;
  overflow: hidden;
}

.json-tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ebeef5;
}

.section-header h3 {
  margin: 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.input-info,
.output-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.json-analysis {
  margin-top: 2rem;
}

.stat-card {
  margin-bottom: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
  padding: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #606266;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #409eff;
}

.depth-info {
  margin-top: 1rem;
}

.error-section {
  margin-top: 2rem;
}

.error-details {
  margin-top: 1rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .json-tools {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .tool-container {
    padding: 1rem;
  }
  
  .tool-header h1 {
    font-size: 1.5rem;
  }
  
  .tool-header p {
    font-size: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .tool-container {
    padding: 0.5rem;
  }
  
  .tool-header h1 {
    font-size: 1.3rem;
  }
}
</style>