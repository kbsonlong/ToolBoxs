<template>
  <div class="tool-container">
    <div class="tool-header">
      <h1>
        <el-icon><Key /></el-icon>
        MD5哈希计算
      </h1>
      <p>MD5哈希值计算和验证工具，支持文本和文件处理</p>
    </div>

    <el-card class="tool-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 文本哈希计算 -->
        <el-tab-pane label="文本哈希" name="text">
          <div class="input-section">
            <div class="section-header">
              <h3>输入文本</h3>
              <el-space>
                <el-button @click="clearInput" :icon="Delete">清空</el-button>
                <el-button @click="loadSample" :icon="DocumentAdd">示例文本</el-button>
              </el-space>
            </div>
            
            <el-input
              v-model="inputText"
              type="textarea"
              placeholder="请输入要计算MD5哈希的文本..."
              :rows="6"
              resize="vertical"
              show-word-limit
              maxlength="100000"
              @input="calculateHash"
            />
            
            <div class="input-info">
              <el-space>
                <el-text size="small" type="info">
                  字符数: {{ inputText.length }}
                </el-text>
                <el-text size="small" type="info">
                  字节数: {{ getByteLength(inputText) }}
                </el-text>
                <el-text size="small" type="info">
                  编码: UTF-8
                </el-text>
              </el-space>
            </div>
          </div>

          <div class="output-section">
            <div class="section-header">
              <h3>MD5哈希结果</h3>
              <el-space>
                <el-button 
                  @click="copyHash" 
                  :icon="DocumentCopy"
                  :disabled="!md5Hash"
                >
                  复制哈希
                </el-button>
                <el-button 
                  @click="downloadHash" 
                  :icon="Download"
                  :disabled="!md5Hash"
                >
                  下载结果
                </el-button>
              </el-space>
            </div>
            
            <el-input
              v-model="md5Hash"
              placeholder="MD5哈希值将显示在这里..."
              readonly
            >
              <template #prepend>MD5</template>
            </el-input>
            
            <div class="hash-formats" v-if="md5Hash">
              <h4>不同格式</h4>
              <el-space direction="vertical" fill style="width: 100%">
                <el-input v-model="hashFormats.lowercase" readonly>
                  <template #prepend>小写</template>
                  <template #append>
                    <el-button @click="copyFormat('lowercase')" :icon="DocumentCopy" size="small" />
                  </template>
                </el-input>
                <el-input v-model="hashFormats.uppercase" readonly>
                  <template #prepend>大写</template>
                  <template #append>
                    <el-button @click="copyFormat('uppercase')" :icon="DocumentCopy" size="small" />
                  </template>
                </el-input>
                <el-input v-model="hashFormats.withColons" readonly>
                  <template #prepend>冒号分隔</template>
                  <template #append>
                    <el-button @click="copyFormat('withColons')" :icon="DocumentCopy" size="small" />
                  </template>
                </el-input>
                <el-input v-model="hashFormats.withDashes" readonly>
                  <template #prepend>短横线分隔</template>
                  <template #append>
                    <el-button @click="copyFormat('withDashes')" :icon="DocumentCopy" size="small" />
                  </template>
                </el-input>
              </el-space>
            </div>
          </div>
        </el-tab-pane>

        <!-- 哈希验证 -->
        <el-tab-pane label="哈希验证" name="verify">
          <div class="verify-section">
            <div class="input-section">
              <h3>原始文本</h3>
              <el-input
                v-model="verifyText"
                type="textarea"
                placeholder="请输入原始文本..."
                :rows="4"
                @input="handleVerifyInput"
              />
            </div>
            
            <div class="input-section">
              <h3>MD5哈希值</h3>
              <el-input
                v-model="verifyHash"
                placeholder="请输入要验证的MD5哈希值..."
                @input="handleVerifyInput"
              />
            </div>
            
            <div class="verify-result" v-if="verifyText && verifyHash">
              <el-alert
                :title="verifyResult.isValid ? '验证通过' : '验证失败'"
                :type="verifyResult.isValid ? 'success' : 'error'"
                :description="verifyResult.message"
                show-icon
                :closable="false"
              />
              
              <div class="verify-details">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="计算得到的MD5">{{ verifyResult.calculatedHash }}</el-descriptions-item>
                  <el-descriptions-item label="提供的MD5">{{ verifyResult.providedHash }}</el-descriptions-item>
                  <el-descriptions-item label="匹配结果">
                    <el-tag :type="verifyResult.isValid ? 'success' : 'danger'">
                      {{ verifyResult.isValid ? '匹配' : '不匹配' }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 批量计算 -->
        <el-tab-pane label="批量计算" name="batch">
          <div class="batch-section">
            <div class="input-section">
              <div class="section-header">
                <h3>批量文本输入</h3>
                <el-space>
                  <el-button @click="clearBatchInput" :icon="Delete">清空</el-button>
                  <el-button @click="loadBatchSample" :icon="DocumentAdd">示例数据</el-button>
                  <el-button @click="calculateBatchHashes" :icon="Operation" type="primary">
                    批量计算
                  </el-button>
                </el-space>
              </div>
              
              <el-input
                v-model="batchInput"
                type="textarea"
                placeholder="请输入多行文本，每行一个要计算哈希的字符串..."
                :rows="8"
                resize="vertical"
              />
              
              <div class="batch-info">
                <el-text size="small" type="info">
                  输入行数: {{ batchInputLines }}
                </el-text>
              </div>
            </div>
            
            <div class="batch-results" v-if="batchResults.length > 0">
              <div class="section-header">
                <h3>批量计算结果</h3>
                <el-space>
                  <el-button @click="copyBatchResults" :icon="DocumentCopy">
                    复制全部结果
                  </el-button>
                  <el-button @click="downloadBatchResults" :icon="Download">
                    下载CSV文件
                  </el-button>
                  <el-button @click="clearBatchResults" :icon="Delete">
                    清空结果
                  </el-button>
                </el-space>
              </div>
              
              <el-table :data="batchResults" border stripe max-height="400">
                <el-table-column prop="index" label="序号" width="80" align="center" />
                <el-table-column prop="text" label="原始文本" min-width="200" show-overflow-tooltip />
                <el-table-column prop="hash" label="MD5哈希" min-width="250" show-overflow-tooltip>
                  <template #default="{ row }">
                    <div class="hash-cell">
                      <code>{{ row.hash }}</code>
                      <el-button 
                        @click="copyText(row.hash)" 
                        :icon="DocumentCopy" 
                        size="small" 
                        text
                      />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="length" label="长度" width="80" align="center" />
              </el-table>
              
              <div class="batch-summary">
                <el-space>
                  <el-text size="small" type="success">
                    成功计算: {{ batchResults.length }} 个哈希值
                  </el-text>
                  <el-text size="small" type="info">
                    总耗时: {{ batchProcessTime }}ms
                  </el-text>
                </el-space>
              </div>
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
  Key,
  DocumentCopy,
  Download,
  Delete,
  DocumentAdd,
  Operation
} from '@element-plus/icons-vue'
import { generateMD5, verifyHash as verifyHashUtil } from '@/services/cryptoService'
import { formatFileSize } from '@/utils/formatters'

// 响应式数据
const activeTab = ref('text')
const inputText = ref('')
const md5Hash = ref('')
const verifyText = ref('')
const verifyHash = ref('')
const batchInput = ref('')
const batchResults = ref<Array<{
  index: number
  text: string
  hash: string
  length: number
}>>([])
const batchProcessTime = ref(0)

// 计算属性
const hashFormats = computed(() => {
  if (!md5Hash.value) return {
    lowercase: '',
    uppercase: '',
    withColons: '',
    withDashes: ''
  }
  
  const hash = md5Hash.value.toLowerCase()
  return {
    lowercase: hash,
    uppercase: hash.toUpperCase(),
    withColons: hash.replace(/(..)/g, '$1:').slice(0, -1),
    withDashes: hash.replace(/(..)/g, '$1-').slice(0, -1)
  }
})

const verifyResult = computed(() => {
  if (!verifyText.value || !verifyHash.value) {
    return {
      isValid: false,
      message: '',
      calculatedHash: '',
      providedHash: ''
    }
  }
  
  const calculatedHash = generateMD5(verifyText.value)
  const providedHash = verifyHash.value.toLowerCase().replace(/[^a-f0-9]/g, '')
  const isValid = calculatedHash.toLowerCase() === providedHash
  
  return {
    isValid,
    message: isValid ? 'MD5哈希值匹配，验证通过' : 'MD5哈希值不匹配，验证失败',
    calculatedHash,
    providedHash
  }
})

const batchInputLines = computed(() => {
  return batchInput.value.split('\n').filter(line => line.trim()).length
})

/**
 * 计算MD5哈希
 */
const calculateHash = () => {
  if (!inputText.value.trim()) {
    md5Hash.value = ''
    return
  }
  
  try {
    md5Hash.value = generateMD5(inputText.value)
  } catch (error) {
    console.error('计算MD5失败:', error)
    ElMessage.error('计算MD5失败')
  }
}

// 监听器
watch(inputText, () => {
  calculateHash()
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
  md5Hash.value = ''
}

/**
 * 加载示例文本
 */
const loadSample = () => {
  inputText.value = 'Hello, World! 这是一个MD5哈希计算的示例文本。'
}

/**
 * 复制哈希值
 */
const copyHash = async () => {
  if (!md5Hash.value) return
  
  try {
    await navigator.clipboard.writeText(md5Hash.value)
    ElMessage.success('MD5哈希值已复制')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

/**
 * 复制指定格式的哈希值
 */
const copyFormat = async (format: keyof typeof hashFormats.value) => {
  const value = hashFormats.value[format]
  if (!value) return
  
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success(`${format}格式已复制`)
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

/**
 * 下载哈希结果
 */
const downloadHash = () => {
  if (!md5Hash.value) return
  
  const content = `原始文本: ${inputText.value}\n\nMD5哈希值:\n小写: ${hashFormats.value.lowercase}\n大写: ${hashFormats.value.uppercase}\n冒号分隔: ${hashFormats.value.withColons}\n短横线分隔: ${hashFormats.value.withDashes}\n\n计算时间: ${new Date().toLocaleString()}`
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'md5_hash_result.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('下载成功')
}

/**
 * 处理验证输入
 */
const handleVerifyInput = () => {
  // 验证结果通过计算属性自动更新
}

/**
 * 清空批量输入
 */
const clearBatchInput = () => {
  batchInput.value = ''
}

/**
 * 加载批量示例数据
 */
const loadBatchSample = () => {
  batchInput.value = `Hello World\nVue.js\nElement Plus\nMD5 Hash\n测试文本\n123456\npassword\nadmin@example.com`
}

/**
 * 批量计算哈希值
 */
const calculateBatchHashes = () => {
  if (!batchInput.value.trim()) {
    ElMessage.warning('请输入要计算的文本')
    return
  }
  
  const startTime = Date.now()
  const lines = batchInput.value.split('\n').filter(line => line.trim())
  
  try {
    const results = lines.map((text, index) => ({
      index: index + 1,
      text: text.trim(),
      hash: generateMD5(text.trim()),
      length: text.trim().length
    }))
    
    batchResults.value = results
    batchProcessTime.value = Date.now() - startTime
    
    ElMessage.success(`成功计算 ${results.length} 个MD5哈希值`)
  } catch (error) {
    console.error('批量计算失败:', error)
    ElMessage.error('批量计算失败')
  }
}

/**
 * 复制批量结果
 */
const copyBatchResults = async () => {
  if (batchResults.value.length === 0) return
  
  const content = batchResults.value
    .map(item => `${item.text}\t${item.hash}`)
    .join('\n')
  
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('批量结果已复制')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

/**
 * 下载批量结果CSV
 */
const downloadBatchResults = () => {
  if (batchResults.value.length === 0) return
  
  const csvContent = [
    'Index,Text,MD5Hash,Length',
    ...batchResults.value.map(item => 
      `${item.index},"${item.text.replace(/"/g, '""')}",${item.hash},${item.length}`
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'md5_batch_results.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('CSV文件下载成功')
}

/**
 * 清空批量结果
 */
const clearBatchResults = () => {
  batchResults.value = []
  batchProcessTime.value = 0
}

/**
 * 复制文本
 */
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
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
.output-section,
.verify-section,
.batch-section {
  margin-bottom: 2rem;
}

.input-info,
.batch-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.hash-formats {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.hash-formats h4 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1rem;
  font-weight: 600;
}

.verify-result {
  margin-top: 1.5rem;
}

.verify-details {
  margin-top: 1rem;
}

.hash-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.hash-cell code {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  color: #e6a23c;
}

.batch-summary {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f0f9ff;
  border-radius: 6px;
  text-align: center;
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
  
  .hash-cell {
    flex-direction: column;
    align-items: flex-start;
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