<template>
  <div class="tool-container">
    <div class="tool-header">
      <h1>
        <el-icon><Document /></el-icon>
        Base64编码解码
      </h1>
      <p>Base64字符串编码和解码工具，支持文本和文件处理</p>
    </div>

    <el-card class="tool-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 文本编码解码 -->
        <el-tab-pane label="文本处理" name="text">
          <div class="input-section">
            <div class="section-header">
              <h3>输入内容</h3>
              <el-space>
                <el-button-group>
                  <el-button 
                    :type="mode === 'encode' ? 'primary' : 'default'"
                    @click="mode = 'encode'"
                  >
                    编码
                  </el-button>
                  <el-button 
                    :type="mode === 'decode' ? 'primary' : 'default'"
                    @click="mode = 'decode'"
                  >
                    解码
                  </el-button>
                </el-button-group>
                <el-button @click="clearInput" :icon="Delete">清空</el-button>
                <el-button @click="swapContent" :icon="Switch">交换</el-button>
              </el-space>
            </div>
            
            <el-input
              v-model="inputText"
              type="textarea"
              :placeholder="mode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的Base64字符串...'"
              :rows="8"
              resize="vertical"
              show-word-limit
              maxlength="10000"
              @input="handleInput"
            />
            
            <div class="input-info">
              <el-space>
                <el-text size="small" type="info">
                  字符数: {{ inputText.length }}
                </el-text>
                <el-text size="small" type="info">
                  字节数: {{ getByteLength(inputText) }}
                </el-text>
                <el-text v-if="mode === 'decode' && inputText" size="small" :type="isValidBase64(inputText) ? 'success' : 'danger'">
                  {{ isValidBase64(inputText) ? '✓ 有效的Base64' : '✗ 无效的Base64' }}
                </el-text>
              </el-space>
            </div>
          </div>

          <div class="output-section">
            <div class="section-header">
              <h3>输出结果</h3>
              <el-space>
                <el-button 
                  @click="copyResult" 
                  :icon="DocumentCopy"
                  :disabled="!outputText"
                >
                  复制结果
                </el-button>
                <el-button 
                  @click="downloadResult" 
                  :icon="Download"
                  :disabled="!outputText"
                >
                  下载结果
                </el-button>
              </el-space>
            </div>
            
            <el-input
              v-model="outputText"
              type="textarea"
              :placeholder="mode === 'encode' ? 'Base64编码结果将显示在这里...' : '解码结果将显示在这里...'"
              :rows="8"
              resize="vertical"
              readonly
            />
            
            <div class="output-info" v-if="outputText">
              <el-space>
                <el-text size="small" type="success">
                  输出长度: {{ outputText.length }}
                </el-text>
                <el-text size="small" type="success">
                  字节数: {{ getByteLength(outputText) }}
                </el-text>
                <el-text v-if="mode === 'encode'" size="small" type="info">
                  压缩率: {{ compressionRatio }}%
                </el-text>
              </el-space>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  DocumentCopy,
  Download,
  Delete,
  Switch
} from '@element-plus/icons-vue'
import { encodeBase64, decodeBase64, isValidBase64 } from '@/services/cryptoService'
import { formatFileSize } from '@/utils/formatters'

// 响应式数据
const activeTab = ref('text')
const mode = ref<'encode' | 'decode'>('encode')
const inputText = ref('')
const outputText = ref('')

// 计算属性
/**
 * 处理输入变化
 */
const handleInput = () => {
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  try {
    if (mode.value === 'encode') {
      outputText.value = encodeBase64(inputText.value)
    } else {
      if (isValidBase64(inputText.value)) {
        outputText.value = decodeBase64(inputText.value)
      } else {
        outputText.value = ''
        ElMessage.error('无效的Base64格式')
      }
    }
  } catch (error) {
    outputText.value = ''
    ElMessage.error('转换失败：' + (error as Error).message)
  }
}

const compressionRatio = computed(() => {
  if (!inputText.value || !outputText.value) return 0
  return Math.round((outputText.value.length / inputText.value.length) * 100)
})

// 监听器
watch([inputText, mode], () => {
  handleInput()
}, { immediate: true })

/**
 * 获取字符串字节长度
 */
const getByteLength = (str: string): number => {
  return new Blob([str]).size
}



/**
 * 清空输入
 */
const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
}

/**
 * 交换输入输出内容
 */
const swapContent = () => {
  if (!outputText.value) return
  
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  
  // 切换模式
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}

/**
 * 复制结果
 */
const copyResult = async () => {
  if (!outputText.value) return
  
  try {
    await navigator.clipboard.writeText(outputText.value)
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
  if (!outputText.value) return
  
  const blob = new Blob([outputText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `base64_${mode.value}_result.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('下载成功')
}
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
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

.input-section,
.output-section {
  margin-bottom: 2rem;
}

.input-info,
.output-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

/* 响应式设计 */
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