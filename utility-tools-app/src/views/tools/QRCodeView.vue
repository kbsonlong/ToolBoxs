<template>
  <div class="tool-container">
    <div class="tool-header">
      <h1>
        <el-icon><Grid /></el-icon>
        二维码生成器
      </h1>
      <p>生成各种类型的二维码，支持文本、URL、WiFi、名片等</p>
    </div>

    <el-card class="tool-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基础生成 -->
        <el-tab-pane label="基础生成" name="basic">
          <div class="basic-section">
            <el-row :gutter="20">
              <el-col :xs="24" :lg="12">
                <div class="input-section">
                  <h3>内容输入</h3>
                  
                  <el-form label-width="100px">
                    <el-form-item label="二维码类型">
                      <el-select v-model="qrType" @change="onTypeChange" style="width: 100%">
                        <el-option label="纯文本" value="text" />
                        <el-option label="网址链接" value="url" />
                        <el-option label="电子邮件" value="email" />
                        <el-option label="电话号码" value="phone" />
                        <el-option label="短信" value="sms" />
                        <el-option label="WiFi" value="wifi" />
                        <el-option label="名片" value="vcard" />
                        <el-option label="地理位置" value="location" />
                      </el-select>
                    </el-form-item>
                    
                    <!-- 文本输入 -->
                    <el-form-item label="内容" v-if="qrType === 'text'">
                      <el-input
                        v-model="textContent"
                        type="textarea"
                        :rows="4"
                        placeholder="输入要生成二维码的文本内容"
                        @input="generateQRCode"
                        maxlength="2000"
                        show-word-limit
                      />
                    </el-form-item>
                    
                    <!-- URL输入 -->
                    <el-form-item label="网址" v-if="qrType === 'url'">
                      <el-input
                        v-model="urlContent"
                        placeholder="https://example.com"
                        @input="generateQRCode"
                      >
                        <template #prepend>URL</template>
                      </el-input>
                    </el-form-item>
                    
                    <!-- 邮件输入 -->
                    <template v-if="qrType === 'email'">
                      <el-form-item label="邮箱地址">
                        <el-input v-model="emailData.email" placeholder="example@email.com" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="邮件主题">
                        <el-input v-model="emailData.subject" placeholder="邮件主题（可选）" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="邮件内容">
                        <el-input
                          v-model="emailData.body"
                          type="textarea"
                          :rows="3"
                          placeholder="邮件内容（可选）"
                          @input="generateQRCode"
                        />
                      </el-form-item>
                    </template>
                    
                    <!-- 电话输入 -->
                    <el-form-item label="电话号码" v-if="qrType === 'phone'">
                      <el-input
                        v-model="phoneContent"
                        placeholder="+86 138 0013 8000"
                        @input="generateQRCode"
                      >
                        <template #prepend>TEL</template>
                      </el-input>
                    </el-form-item>
                    
                    <!-- 短信输入 -->
                    <template v-if="qrType === 'sms'">
                      <el-form-item label="手机号码">
                        <el-input v-model="smsData.phone" placeholder="+86 138 0013 8000" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="短信内容">
                        <el-input
                          v-model="smsData.message"
                          type="textarea"
                          :rows="3"
                          placeholder="短信内容（可选）"
                          @input="generateQRCode"
                        />
                      </el-form-item>
                    </template>
                    
                    <!-- WiFi输入 -->
                    <template v-if="qrType === 'wifi'">
                      <el-form-item label="网络名称">
                        <el-input v-model="wifiData.ssid" placeholder="WiFi网络名称" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="密码">
                        <el-input
                          v-model="wifiData.password"
                          type="password"
                          placeholder="WiFi密码"
                          show-password
                          @input="generateQRCode"
                        />
                      </el-form-item>
                      <el-form-item label="加密类型">
                        <el-select v-model="wifiData.security" @change="generateQRCode" style="width: 100%">
                          <el-option label="WPA/WPA2" value="WPA" />
                          <el-option label="WEP" value="WEP" />
                          <el-option label="无加密" value="nopass" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="隐藏网络">
                        <el-switch v-model="wifiData.hidden" @change="generateQRCode" />
                      </el-form-item>
                    </template>
                    
                    <!-- 名片输入 -->
                    <template v-if="qrType === 'vcard'">
                      <el-form-item label="姓名">
                        <el-input v-model="vcardData.name" placeholder="姓名" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="公司">
                        <el-input v-model="vcardData.organization" placeholder="公司名称" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="职位">
                        <el-input v-model="vcardData.title" placeholder="职位" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="电话">
                        <el-input v-model="vcardData.phone" placeholder="电话号码" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="邮箱">
                        <el-input v-model="vcardData.email" placeholder="邮箱地址" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="网址">
                        <el-input v-model="vcardData.url" placeholder="个人或公司网址" @input="generateQRCode" />
                      </el-form-item>
                      <el-form-item label="地址">
                        <el-input
                          v-model="vcardData.address"
                          type="textarea"
                          :rows="2"
                          placeholder="地址"
                          @input="generateQRCode"
                        />
                      </el-form-item>
                    </template>
                    
                    <!-- 地理位置输入 -->
                    <template v-if="qrType === 'location'">
                      <el-form-item label="纬度">
                        <el-input
                          v-model="locationData.latitude"
                          placeholder="39.9042"
                          @input="generateQRCode"
                        >
                          <template #prepend>LAT</template>
                        </el-input>
                      </el-form-item>
                      <el-form-item label="经度">
                        <el-input
                          v-model="locationData.longitude"
                          placeholder="116.4074"
                          @input="generateQRCode"
                        >
                          <template #prepend>LNG</template>
                        </el-input>
                      </el-form-item>
                      <el-form-item label="位置名称">
                        <el-input
                          v-model="locationData.name"
                          placeholder="位置名称（可选）"
                          @input="generateQRCode"
                        />
                      </el-form-item>
                    </template>
                  </el-form>
                </div>
              </el-col>
              
              <el-col :xs="24" :lg="12">
                <div class="result-section">
                  <h3>生成结果</h3>
                  
                  <div class="qr-display" v-if="qrCodeDataURL">
                    <div class="qr-image-container">
                      <img :src="qrCodeDataURL" alt="QR Code" class="qr-image" />
                    </div>
                    
                    <div class="qr-info">
                      <el-descriptions :column="2" size="small" border>
                        <el-descriptions-item label="类型">{{ getTypeLabel(qrType) }}</el-descriptions-item>
                        <el-descriptions-item label="大小">{{ qrSize }}x{{ qrSize }}</el-descriptions-item>
                        <el-descriptions-item label="纠错级别">{{ errorCorrectionLevel }}</el-descriptions-item>
                        <el-descriptions-item label="数据长度">{{ currentContent.length }} 字符</el-descriptions-item>
                      </el-descriptions>
                    </div>
                    
                    <div class="qr-actions">
                      <el-space wrap>
                        <el-button @click="copyQRCode" :icon="DocumentCopy">
                          复制图片
                        </el-button>
                        <el-button @click="downloadQRCode" :icon="Download">
                          下载PNG
                        </el-button>
                        <el-button @click="downloadSVG" :icon="Download">
                          下载SVG
                        </el-button>
                        <el-button @click="copyContent" :icon="DocumentCopy">
                          复制内容
                        </el-button>
                      </el-space>
                    </div>
                  </div>
                  
                  <div class="qr-placeholder" v-else>
                    <el-empty description="请输入内容生成二维码" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 高级设置 -->
        <el-tab-pane label="高级设置" name="advanced">
          <div class="advanced-section">
            <el-row :gutter="20">
              <el-col :xs="24" :lg="12">
                <div class="settings-panel">
                  <h3>样式设置</h3>
                  
                  <el-form label-width="120px">
                    <el-form-item label="二维码大小">
                      <el-slider
                        v-model="qrSize"
                        :min="100"
                        :max="800"
                        :step="50"
                        show-input
                        @change="generateQRCode"
                      />
                    </el-form-item>
                    
                    <el-form-item label="纠错级别">
                      <el-select v-model="errorCorrectionLevel" @change="generateQRCode" style="width: 100%">
                        <el-option label="低 (L) ~7%" value="L" />
                        <el-option label="中 (M) ~15%" value="M" />
                        <el-option label="四分位 (Q) ~25%" value="Q" />
                        <el-option label="高 (H) ~30%" value="H" />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item label="边距">
                      <el-input-number
                        v-model="margin"
                        :min="0"
                        :max="10"
                        @change="generateQRCode"
                        style="width: 100%"
                      />
                    </el-form-item>
                    
                    <el-form-item label="前景色">
                      <el-color-picker v-model="foregroundColor" @change="generateQRCode" />
                    </el-form-item>
                    
                    <el-form-item label="背景色">
                      <el-color-picker v-model="backgroundColor" @change="generateQRCode" />
                    </el-form-item>
                  </el-form>
                </div>
              </el-col>
              
              <el-col :xs="24" :lg="12">
                <div class="preview-panel">
                  <h3>预览</h3>
                  
                  <div class="advanced-preview" v-if="qrCodeDataURL">
                    <div class="preview-container">
                      <img :src="qrCodeDataURL" alt="QR Code Preview" class="preview-image" />
                    </div>
                    
                    <div class="preview-info">
                      <el-tag>{{ qrSize }}x{{ qrSize }}px</el-tag>
                      <el-tag type="info">{{ errorCorrectionLevel }}级纠错</el-tag>
                      <el-tag type="warning">边距: {{ margin }}</el-tag>
                    </div>
                  </div>
                  
                  <div class="capacity-info">
                    <h4>容量信息</h4>
                    <el-progress
                      :percentage="capacityPercentage"
                      :color="getCapacityColor(capacityPercentage)"
                      :status="capacityPercentage > 90 ? 'exception' : undefined"
                    />
                    <p class="capacity-text">
                      已使用: {{ currentContent.length }} / {{ maxCapacity }} 字符
                    </p>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 批量生成 -->
        <el-tab-pane label="批量生成" name="batch">
          <div class="batch-section">
            <div class="batch-input">
              <h3>批量生成</h3>
              <el-input
                v-model="batchContent"
                type="textarea"
                :rows="8"
                placeholder="每行一个内容，将为每行生成一个二维码&#10;例如：&#10;https://example1.com&#10;https://example2.com&#10;联系电话：138-0013-8000"
                @input="updateBatchPreview"
              />
              
              <div class="batch-actions">
                <el-space>
                  <el-button type="primary" @click="generateBatchQRCodes" :loading="batchGenerating">
                    {{ batchGenerating ? '生成中...' : '批量生成' }}
                  </el-button>
                  <el-button @click="clearBatchResults" :disabled="batchResults.length === 0">
                    清空结果
                  </el-button>
                  <el-button @click="downloadAllQRCodes" :disabled="batchResults.length === 0" :icon="Download">
                    下载全部
                  </el-button>
                </el-space>
              </div>
            </div>
            
            <div class="batch-results" v-if="batchResults.length > 0">
              <h3>生成结果 ({{ batchResults.length }} 个)</h3>
              <div class="batch-grid">
                <div
                  v-for="(result, index) in batchResults"
                  :key="index"
                  class="batch-item"
                >
                  <div class="batch-qr">
                    <img :src="result.dataURL" alt="QR Code" class="batch-qr-image" />
                  </div>
                  <div class="batch-info">
                    <div class="batch-content">{{ result.content.substring(0, 30) }}{{ result.content.length > 30 ? '...' : '' }}</div>
                    <div class="batch-actions-mini">
                      <el-button @click="copyBatchQRCode(result.dataURL)" :icon="DocumentCopy" size="small" />
                      <el-button @click="downloadBatchQRCode(result.dataURL, index)" :icon="Download" size="small" />
                    </div>
                  </div>
                </div>
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
  Grid,
  DocumentCopy,
  Download
} from '@element-plus/icons-vue'
import {
  generateQRCode as generateQRCodeUtil,
  formatQRCodeText,
  getQRCodeCapacity,
  QRCodeOptions,
  QRCodeResult
} from '@/services/qrService'

// 响应式数据
const activeTab = ref('basic')
const qrType = ref<'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'location'>('text')
const qrSize = ref(300)
const errorCorrectionLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const margin = ref(4)
const foregroundColor = ref('#000000')
const backgroundColor = ref('#ffffff')

// 内容数据
const textContent = ref('')
const urlContent = ref('')
const phoneContent = ref('')
const emailData = ref({
  email: '',
  subject: '',
  body: ''
})
const smsData = ref({
  phone: '',
  message: ''
})
const wifiData = ref({
  ssid: '',
  password: '',
  security: 'WPA' as 'WPA' | 'WEP' | 'nopass',
  hidden: false
})
const vcardData = ref({
  name: '',
  organization: '',
  title: '',
  phone: '',
  email: '',
  url: '',
  address: ''
})
const locationData = ref({
  latitude: '',
  longitude: '',
  name: ''
})

// 结果数据
const qrCodeDataURL = ref('')
const qrCodeSVG = ref('')
const batchContent = ref('')
const batchGenerating = ref(false)
const batchResults = ref<Array<{
  content: string
  dataURL: string
}>>([])

// 计算属性
const currentContent = computed(() => {
  switch (qrType.value) {
    case 'text':
      return textContent.value
    case 'url':
      return urlContent.value
    case 'phone':
      return phoneContent.value
    case 'email':
      return formatQRCodeText(qrType.value, emailData.value)
    case 'sms':
      return formatQRCodeText(qrType.value, smsData.value)
    case 'wifi':
      return formatQRCodeText(qrType.value, wifiData.value)
    case 'vcard':
      return formatQRCodeText(qrType.value, vcardData.value)
    case 'location':
      return formatQRCodeText(qrType.value, locationData.value)
    default:
      return ''
  }
})

const maxCapacity = computed(() => {
  return getQRCodeCapacity(errorCorrectionLevel.value)
})

const capacityPercentage = computed(() => {
  if (maxCapacity.value === 0) return 0
  return Math.min(100, (currentContent.value.length / maxCapacity.value) * 100)
})

// 监听器
watch(() => [qrSize.value, errorCorrectionLevel.value, margin.value, foregroundColor.value, backgroundColor.value], () => {
  if (currentContent.value) {
    generateQRCode()
  }
}, { deep: true })

// 方法
/**
 * 生成二维码
 */
const generateQRCode = async () => {
  if (!currentContent.value.trim()) {
    qrCodeDataURL.value = ''
    qrCodeSVG.value = ''
    return
  }
  
  try {
    const options: QRCodeOptions = {
      text: currentContent.value,
      size: qrSize.value,
      errorCorrectionLevel: errorCorrectionLevel.value,
      margin: margin.value,
      color: {
        dark: foregroundColor.value,
        light: backgroundColor.value
      },
      type: qrType.value
    }
    
    // 生成二维码
    const result = await generateQRCodeUtil(options)
    if (result.success && result.dataUrl) {
      qrCodeDataURL.value = result.dataUrl
      qrCodeSVG.value = result.svg || ''
    } else {
      throw new Error(result.error || '生成失败')
    }
  } catch (error) {
    console.error('二维码生成失败:', error)
    ElMessage.error('二维码生成失败')
  }
}

/**
 * 类型改变处理
 */
const onTypeChange = () => {
  // 清空当前内容
  textContent.value = ''
  urlContent.value = ''
  phoneContent.value = ''
  emailData.value = { email: '', subject: '', body: '' }
  smsData.value = { phone: '', message: '' }
  wifiData.value = { ssid: '', password: '', security: 'WPA', hidden: false }
  vcardData.value = { name: '', organization: '', title: '', phone: '', email: '', url: '', address: '' }
  locationData.value = { latitude: '', longitude: '', name: '' }
  
  qrCodeDataURL.value = ''
  qrCodeSVG.value = ''
}

/**
 * 获取类型标签
 */
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    text: '纯文本',
    url: '网址链接',
    email: '电子邮件',
    phone: '电话号码',
    sms: '短信',
    wifi: 'WiFi',
    vcard: '名片',
    location: '地理位置'
  }
  return labels[type] || type
}

/**
 * 获取容量颜色
 */
const getCapacityColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

/**
 * 复制二维码图片
 */
const copyQRCode = async () => {
  try {
    const response = await fetch(qrCodeDataURL.value)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    ElMessage.success('二维码图片已复制')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请尝试右键保存图片')
  }
}

/**
 * 下载二维码PNG
 */
const downloadQRCode = () => {
  const link = document.createElement('a')
  link.href = qrCodeDataURL.value
  link.download = `qrcode-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 下载二维码SVG
 */
const downloadSVG = () => {
  if (!qrCodeSVG.value) {
    ElMessage.warning('暂无SVG格式可下载')
    return
  }
  const blob = new Blob([qrCodeSVG.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `qrcode-${Date.now()}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 复制内容
 */
const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(currentContent.value)
    ElMessage.success('内容已复制')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

/**
 * 更新批量预览
 */
const updateBatchPreview = () => {
  // 批量预览逻辑
}

/**
 * 批量生成二维码
 */
const generateBatchQRCodes = async () => {
  if (!batchContent.value.trim()) {
    ElMessage.warning('请输入要生成的内容')
    return
  }
  
  batchGenerating.value = true
  batchResults.value = []
  
  try {
    const lines = batchContent.value.split('\n').filter(line => line.trim())
    
    for (let i = 0; i < lines.length; i++) {
      const content = lines[i].trim()
      if (!content) continue
      
      const options: QRCodeOptions = {
        text: content,
        size: qrSize.value,
        errorCorrectionLevel: errorCorrectionLevel.value,
        margin: margin.value,
        color: {
          dark: foregroundColor.value,
          light: backgroundColor.value
        },
        type: 'text'
      }
      
      try {
        const result = await generateQRCodeUtil(options)
        if (result.success && result.dataUrl) {
          batchResults.value.push({
            content,
            dataURL: result.dataUrl
          })
        }
      } catch (error) {
        console.error(`生成第${i + 1}个二维码失败:`, error)
      }
      
      // 添加小延迟避免阻塞UI
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
    
    ElMessage.success(`成功生成 ${batchResults.value.length} 个二维码`)
  } catch (error) {
    console.error('批量生成失败:', error)
    ElMessage.error('批量生成失败')
  } finally {
    batchGenerating.value = false
  }
}

/**
 * 清空批量结果
 */
const clearBatchResults = () => {
  batchResults.value = []
  batchContent.value = ''
}

/**
 * 下载所有二维码
 */
const downloadAllQRCodes = () => {
  batchResults.value.forEach((result, index) => {
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = result.dataURL
      link.download = `qrcode-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, index * 100) // 延迟下载避免浏览器阻止
  })
}

/**
 * 复制批量二维码
 */
const copyBatchQRCode = async (dataURL: string) => {
  try {
    const response = await fetch(dataURL)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    ElMessage.success('二维码图片已复制')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

/**
 * 下载批量二维码
 */
const downloadBatchQRCode = (dataURL: string, index: number) => {
  const link = document.createElement('a')
  link.href = dataURL
  link.download = `qrcode-${index + 1}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

.input-section,
.result-section,
.settings-panel,
.preview-panel {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.input-section h3,
.result-section h3,
.settings-panel h3,
.preview-panel h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.qr-display {
  text-align: center;
}

.qr-image-container {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  display: inline-block;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.qr-info {
  margin-bottom: 1rem;
}

.qr-actions {
  margin-top: 1rem;
}

.qr-placeholder {
  padding: 2rem;
  text-align: center;
}

.advanced-preview {
  text-align: center;
}

.preview-container {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  display: inline-block;
}

.preview-image {
  max-width: 200px;
  height: auto;
  border-radius: 4px;
}

.preview-info {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.capacity-info {
  margin-top: 2rem;
}

.capacity-info h4 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1rem;
  font-weight: 600;
}

.capacity-text {
  margin: 0.5rem 0 0 0;
  color: #606266;
  font-size: 0.9rem;
  text-align: center;
}

.batch-section {
  padding: 1rem;
}

.batch-input {
  margin-bottom: 2rem;
}

.batch-input h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.batch-actions {
  margin-top: 1rem;
}

.batch-results {
  margin-top: 2rem;
}

.batch-results h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.batch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.batch-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  transition: all 0.3s ease;
}

.batch-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.batch-qr {
  text-align: center;
  margin-bottom: 1rem;
}

.batch-qr-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
}

.batch-info {
  text-align: center;
}

.batch-content {
  font-size: 0.9rem;
  color: #606266;
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.batch-actions-mini {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
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
  
  .batch-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .preview-info {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .tool-container {
    padding: 0.5rem;
  }
  
  .tool-header h1 {
    font-size: 1.3rem;
  }
  
  .batch-grid {
    grid-template-columns: 1fr;
  }
  
  .qr-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>