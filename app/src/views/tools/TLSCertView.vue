<template>
  <div class="tool-container">
    <div class="tool-header">
      <h1>
        <el-icon><Lock /></el-icon>
        TLS证书工具
      </h1>
      <p>解析、验证和分析TLS/SSL证书信息</p>
    </div>

    <el-card class="tool-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 证书解析 -->
        <el-tab-pane label="证书解析" name="parse">
          <div class="parse-section">
            <el-row :gutter="20">
              <el-col :xs="24" :lg="12">
                <div class="input-section">
                  <h3>证书输入</h3>
                  
                  <el-form label-width="100px">
                    <el-form-item label="输入方式">
                      <el-radio-group v-model="inputMethod" @change="clearResults">
                        <el-radio label="text">证书文本</el-radio>
                        <el-radio label="file">证书文件</el-radio>
                        <el-radio label="url">在线获取</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    
                    <!-- 文本输入 -->
                    <el-form-item label="证书内容" v-if="inputMethod === 'text'">
                      <el-input
                        v-model="certText"
                        type="textarea"
                        :rows="8"
                        placeholder="请粘贴PEM格式的证书内容&#10;-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                        @input="parseCertificate"
                      />
                      <div class="input-tips">
                        <el-text size="small" type="info">
                          支持PEM格式证书，可包含多个证书
                        </el-text>
                      </div>
                    </el-form-item>
                    
                    <!-- 文件上传 -->
                    <el-form-item label="证书文件" v-if="inputMethod === 'file'">
                      <el-upload
                        ref="uploadRef"
                        :auto-upload="false"
                        :show-file-list="true"
                        :limit="1"
                        accept=".crt,.cer,.pem,.p7b,.p7c,.der"
                        @change="handleFileChange"
                        drag
                      >
                        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                        <div class="el-upload__text">
                          拖拽文件到此处或<em>点击上传</em>
                        </div>
                        <template #tip>
                          <div class="el-upload__tip">
                            支持 .crt, .cer, .pem, .p7b, .p7c, .der 格式
                          </div>
                        </template>
                      </el-upload>
                    </el-form-item>
                    
                    <!-- URL输入 -->
                    <template v-if="inputMethod === 'url'">
                      <el-form-item label="服务器地址">
                        <el-input
                          v-model="serverUrl"
                          placeholder="example.com:443"
                          @keyup.enter="fetchCertificate"
                        >
                          <template #prepend>https://</template>
                        </el-input>
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" @click="fetchCertificate" :loading="fetching">
                          {{ fetching ? '获取中...' : '获取证书' }}
                        </el-button>
                      </el-form-item>
                    </template>
                  </el-form>
                </div>
              </el-col>
              
              <el-col :xs="24" :lg="12">
                <div class="result-section">
                  <h3>解析结果</h3>
                  
                  <div v-if="certInfo" class="cert-info">
                    <!-- 基本信息 -->
                    <el-card class="info-card" shadow="never">
                      <template #header>
                        <div class="card-header">
                          <span>基本信息</span>
                          <el-tag :type="getValidityType(certInfo.validity.isValid)">
                            {{ certInfo.validity.isValid ? '有效' : '无效' }}
                          </el-tag>
                        </div>
                      </template>
                      
                      <el-descriptions :column="1" size="small">
                        <el-descriptions-item label="通用名称">
                          <el-text>{{ certInfo.subject.commonName || 'N/A' }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="颁发者">
                          <el-text>{{ certInfo.issuer.commonName || 'N/A' }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="序列号">
                          <el-text class="serial-number">{{ certInfo.serialNumber }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="签名算法">
                          <el-text>{{ certInfo.signatureAlgorithm }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="公钥算法">
                          <el-text>{{ certInfo.publicKey.algorithm }} ({{ certInfo.publicKey.size }} bits)</el-text>
                        </el-descriptions-item>
                      </el-descriptions>
                    </el-card>
                    
                    <!-- 有效期信息 -->
                    <el-card class="info-card" shadow="never">
                      <template #header>
                        <span>有效期</span>
                      </template>
                      
                      <el-descriptions :column="1" size="small">
                        <el-descriptions-item label="生效时间">
                          <el-text>{{ formatDate(certInfo.validity.notBefore) }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="过期时间">
                          <el-text :type="getExpiryType(certInfo.validity.notAfter)">
                            {{ formatDate(certInfo.validity.notAfter) }}
                          </el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="剩余天数">
                          <el-text :type="getDaysLeftType(certInfo.validity.daysLeft)">
                            {{ certInfo.validity.daysLeft }} 天
                          </el-text>
                        </el-descriptions-item>
                      </el-descriptions>
                      
                      <div class="validity-progress">
                        <el-progress
                          :percentage="getValidityPercentage(certInfo.validity)"
                          :color="getValidityColor(certInfo.validity)"
                          :status="certInfo.validity.isValid ? undefined : 'exception'"
                        />
                      </div>
                    </el-card>
                    
                    <!-- 域名信息 -->
                    <el-card class="info-card" shadow="never" v-if="certInfo.domains.length > 0">
                      <template #header>
                        <span>域名信息 ({{ certInfo.domains.length }})</span>
                      </template>
                      
                      <div class="domains-list">
                        <el-tag
                          v-for="domain in certInfo.domains"
                          :key="domain"
                          class="domain-tag"
                          :type="domain.startsWith('*.') ? 'warning' : 'info'"
                        >
                          {{ domain }}
                        </el-tag>
                      </div>
                    </el-card>
                    
                    <!-- 扩展信息 -->
                    <el-card class="info-card" shadow="never" v-if="certInfo.extensions">
                      <template #header>
                        <span>扩展信息</span>
                      </template>
                      
                      <el-collapse>
                        <el-collapse-item
                          v-if="certInfo.extensions.keyUsage"
                          key="keyUsage"
                          title="密钥用途"
                          name="keyUsage"
                        >
                          <pre class="extension-content">{{ certInfo.extensions.keyUsage.join(', ') }}</pre>
                        </el-collapse-item>
                        <el-collapse-item
                          v-if="certInfo.extensions.extendedKeyUsage"
                          key="extendedKeyUsage"
                          title="扩展密钥用途"
                          name="extendedKeyUsage"
                        >
                          <pre class="extension-content">{{ certInfo.extensions.extendedKeyUsage.join(', ') }}</pre>
                        </el-collapse-item>
                        <el-collapse-item
                          v-if="certInfo.extensions.subjectAltName"
                          key="subjectAltName"
                          title="主题备用名称"
                          name="subjectAltName"
                        >
                          <pre class="extension-content">{{ certInfo.extensions.subjectAltName.join(', ') }}</pre>
                        </el-collapse-item>
                        <el-collapse-item
                          v-if="certInfo.extensions.basicConstraints"
                          key="basicConstraints"
                          title="基本约束"
                          name="basicConstraints"
                        >
                          <pre class="extension-content">{{ certInfo.extensions.basicConstraints }}</pre>
                        </el-collapse-item>
                      </el-collapse>
                    </el-card>
                  </div>
                  
                  <div v-else-if="parseError" class="error-display">
                    <el-alert
                      :title="parseError"
                      type="error"
                      :closable="false"
                      show-icon
                    />
                  </div>
                  
                  <div v-else class="empty-display">
                    <el-empty description="请输入证书内容进行解析" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 证书验证 -->
        <el-tab-pane label="证书验证" name="verify">
          <div class="verify-section">
            <div class="verify-input">
              <h3>证书链验证</h3>
              
              <el-form label-width="120px">
                <el-form-item label="服务器证书">
                  <el-input
                    v-model="verifyData.serverCert"
                    type="textarea"
                    :rows="4"
                    placeholder="服务器证书 (PEM格式)"
                  />
                </el-form-item>
                
                <el-form-item label="中间证书">
                  <el-input
                    v-model="verifyData.intermediateCert"
                    type="textarea"
                    :rows="4"
                    placeholder="中间证书 (PEM格式，可选)"
                  />
                </el-form-item>
                
                <el-form-item label="根证书">
                  <el-input
                    v-model="verifyData.rootCert"
                    type="textarea"
                    :rows="4"
                    placeholder="根证书 (PEM格式，可选)"
                  />
                </el-form-item>
                
                <el-form-item label="验证域名">
                  <el-input
                    v-model="verifyData.hostname"
                    placeholder="要验证的域名 (可选)"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="verifyCertificate" :loading="verifying">
                    {{ verifying ? '验证中...' : '验证证书链' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="verifyResult" class="verify-result">
              <h3>验证结果</h3>
              
              <el-card shadow="never">
                <div class="verify-status">
                  <el-result
                    :icon="verifyResult.isValid ? 'success' : 'error'"
                    :title="verifyResult.isValid ? '证书链验证通过' : '证书链验证失败'"
                    :sub-title="verifyResult.errors.length > 0 ? verifyResult.errors[0] : '验证完成'"
                  >
                    <template #extra>
                      <div class="verify-details">
                        <el-descriptions :column="2" border>
                          <el-descriptions-item label="证书链完整性">
                            <el-tag :type="verifyResult.details.chain ? 'success' : 'danger'">
                              {{ verifyResult.details.chain ? '完整' : '不完整' }}
                            </el-tag>
                          </el-descriptions-item>
                          <el-descriptions-item label="域名匹配">
                            <el-tag :type="verifyResult.details.hostname ? 'success' : 'danger'">
                              {{ verifyResult.details.hostname ? '匹配' : '不匹配' }}
                            </el-tag>
                          </el-descriptions-item>
                          <el-descriptions-item label="证书有效期">
                            <el-tag :type="verifyResult.details.time ? 'success' : 'danger'">
                              {{ verifyResult.details.time ? '有效' : '无效' }}
                            </el-tag>
                          </el-descriptions-item>
                          <el-descriptions-item label="签名验证">
                            <el-tag :type="verifyResult.details.signature ? 'success' : 'danger'">
                              {{ verifyResult.details.signature ? '通过' : '失败' }}
                            </el-tag>
                          </el-descriptions-item>
                        </el-descriptions>
                        
                        <div v-if="verifyResult.errors.length > 0" class="verify-errors">
                          <h4>验证错误</h4>
                          <el-alert
                            v-for="(error, index) in verifyResult.errors"
                            :key="index"
                            :title="error"
                            type="error"
                            :closable="false"
                            show-icon
                          />
                        </div>
                      </div>
                    </template>
                  </el-result>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- 证书生成 -->
        <el-tab-pane label="证书生成" name="generate">
          <div class="generate-section">
            <el-alert
              title="注意"
              description="此功能仅用于测试和开发环境，生成的自签名证书不应用于生产环境。"
              type="warning"
              :closable="false"
              show-icon
            />
            
            <div class="generate-form">
              <h3>生成自签名证书</h3>
              
              <el-form :model="generateForm" label-width="120px">
                <el-form-item label="通用名称">
                  <el-input v-model="generateForm.commonName" placeholder="example.com" />
                </el-form-item>
                
                <el-form-item label="组织">
                  <el-input v-model="generateForm.organization" placeholder="My Organization" />
                </el-form-item>
                
                <el-form-item label="组织单位">
                  <el-input v-model="generateForm.organizationalUnit" placeholder="IT Department" />
                </el-form-item>
                
                <el-form-item label="国家">
                  <el-input v-model="generateForm.country" placeholder="CN" maxlength="2" />
                </el-form-item>
                
                <el-form-item label="省份">
                  <el-input v-model="generateForm.state" placeholder="Beijing" />
                </el-form-item>
                
                <el-form-item label="城市">
                  <el-input v-model="generateForm.locality" placeholder="Beijing" />
                </el-form-item>
                
                <el-form-item label="有效期">
                  <el-input-number
                    v-model="generateForm.validityDays"
                    :min="1"
                    :max="3650"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span style="margin-left: 10px">天</span>
                </el-form-item>
                
                <el-form-item label="密钥长度">
                  <el-select v-model="generateForm.keySize" style="width: 200px">
                    <el-option label="2048 bits" :value="2048" />
                    <el-option label="3072 bits" :value="3072" />
                    <el-option label="4096 bits" :value="4096" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="备用域名">
                  <el-input
                    v-model="generateForm.altNames"
                    type="textarea"
                    :rows="3"
                    placeholder="每行一个域名&#10;*.example.com&#10;api.example.com"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="generateCertificate" :loading="generating">
                    {{ generating ? '生成中...' : '生成证书' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="generatedCert" class="generated-result">
              <h3>生成结果</h3>
              
              <el-tabs type="border-card">
                <el-tab-pane label="证书" name="cert">
                  <div class="cert-output">
                    <div class="output-header">
                      <span>证书 (PEM格式)</span>
                      <el-button @click="copyCertificate" :icon="DocumentCopy" size="small">
                        复制
                      </el-button>
                    </div>
                    <pre class="cert-content">{{ generatedCert.certificate }}</pre>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="私钥" name="key">
                  <div class="cert-output">
                    <div class="output-header">
                      <span>私钥 (PEM格式)</span>
                      <el-button @click="copyPrivateKey" :icon="DocumentCopy" size="small">
                        复制
                      </el-button>
                    </div>
                    <pre class="cert-content">{{ generatedCert.privateKey }}</pre>
                  </div>
                </el-tab-pane>
              </el-tabs>
              
              <div class="download-actions">
                <el-space>
                  <el-button @click="downloadCertificate" :icon="Download">
                    下载证书
                  </el-button>
                  <el-button @click="downloadPrivateKey" :icon="Download">
                    下载私钥
                  </el-button>
                  <el-button @click="downloadBundle" :icon="Download">
                    下载证书包
                  </el-button>
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Lock,
  UploadFilled,
  DocumentCopy,
  Download
} from '@element-plus/icons-vue'
import {
  parseBase64Certificate,
  validateCertificateChain,
  generateSelfSignedCertificate,
  fetchServerCertificate,
  type CertificateInfo,
  type CertificateValidationResult,
  type SelfSignedCertResult
} from '@/services/tlsService'
import { formatDate } from '@/utils/formatters'

// 响应式数据
const activeTab = ref('parse')
const inputMethod = ref<'text' | 'file' | 'url'>('text')
const certText = ref('')
const serverUrl = ref('')
const fetching = ref(false)
const certInfo = ref<CertificateInfo | null>(null)
const parseError = ref('')

// 验证相关
const verifying = ref(false)
const verifyData = ref({
  serverCert: '',
  intermediateCert: '',
  rootCert: '',
  hostname: ''
})
const verifyResult = ref<CertificateValidationResult | null>(null)

// 生成相关
const generating = ref(false)
const generateForm = ref({
  commonName: '',
  organization: '',
  organizationalUnit: '',
  country: '',
  state: '',
  locality: '',
  validityDays: 365,
  keySize: 2048,
  altNames: ''
})
const generatedCert = ref<SelfSignedCertResult | null>(null)

// 方法
/**
 * 解析证书
 */
const parseCertificate = async () => {
  if (!certText.value.trim()) {
    certInfo.value = null
    parseError.value = ''
    return
  }
  
  try {
      parseError.value = ''
      
      // 预处理输入内容
      const cleanInput = certText.value.trim()
      
      if (!cleanInput) {
        throw new Error('证书内容为空')
      }
      
      // 直接解析输入的证书内容（可能是完整的PEM格式经过base64编码）
      certInfo.value = await parseBase64Certificate(cleanInput)
    } catch (error) {
    console.error('证书解析失败:', error)
    let errorMessage = '证书解析失败'
    
    if (error instanceof Error) {
      if (error.message.includes('Too few bytes')) {
        errorMessage = '证书数据不完整，请检查输入的证书内容是否完整'
      } else if (error.message.includes('无效的Base64格式')) {
        errorMessage = '证书格式错误，请确保输入的是有效的PEM格式证书'
      } else if (error.message.includes('证书内容过短')) {
        errorMessage = '证书内容过短，请输入完整的证书数据'
      } else {
        errorMessage = error.message
      }
    }
    
    parseError.value = errorMessage
    certInfo.value = null
  }
}

/**
 * 处理文件上传
 */
const handleFileChange = (file: { raw: File }) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    certText.value = e.target?.result as string
    parseCertificate()
  }
  reader.readAsText(file.raw)
}

/**
 * 获取服务器证书
 */
const fetchCertificate = async () => {
  if (!serverUrl.value.trim()) {
    ElMessage.warning('请输入服务器地址')
    return
  }
  
  fetching.value = true
  try {
    const cert = await fetchServerCertificate(serverUrl.value)
    certText.value = cert
    await parseCertificate()
    ElMessage.success('证书获取成功')
  } catch (error) {
    console.error('获取证书失败:', error)
    ElMessage.error('获取证书失败')
  } finally {
    fetching.value = false
  }
}

/**
 * 验证证书链
 */
const verifyCertificate = async () => {
  if (!verifyData.value.serverCert.trim()) {
    ElMessage.warning('请输入服务器证书')
    return
  }
  
  verifying.value = true
  try {
    const certificates = [verifyData.value.serverCert]
    if (verifyData.value.intermediateCert) {
      certificates.push(verifyData.value.intermediateCert)
    }
    if (verifyData.value.rootCert) {
      certificates.push(verifyData.value.rootCert)
    }
    verifyResult.value = await validateCertificateChain(certificates)
  } catch (error) {
    console.error('证书验证失败:', error)
    ElMessage.error('证书验证失败')
  } finally {
    verifying.value = false
  }
}

/**
 * 生成自签名证书
 */
const generateCertificate = async () => {
  if (!generateForm.value.commonName.trim()) {
    ElMessage.warning('请输入通用名称')
    return
  }
  
  generating.value = true
  try {
    const altNames = generateForm.value.altNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name)
    
    generatedCert.value = await generateSelfSignedCertificate({
      ...generateForm.value,
      altNames
    })
    
    ElMessage.success('证书生成成功')
  } catch (error) {
    console.error('证书生成失败:', error)
    ElMessage.error('证书生成失败')
  } finally {
    generating.value = false
  }
}

/**
 * 清空结果
 */
const clearResults = () => {
  certInfo.value = null
  parseError.value = ''
  certText.value = ''
  serverUrl.value = ''
}

/**
 * 获取有效性类型
 */
const getValidityType = (isValid: boolean) => {
  return isValid ? 'success' : 'danger'
}

/**
 * 获取过期时间类型
 */
const getExpiryType = (expiryDate: Date) => {
  const now = new Date()
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) return 'danger'
  if (daysLeft < 30) return 'warning'
  return 'success'
}

/**
 * 获取剩余天数类型
 */
const getDaysLeftType = (daysLeft: number) => {
  if (daysLeft < 0) return 'danger'
  if (daysLeft < 30) return 'warning'
  return 'success'
}

/**
 * 获取有效期百分比
 */
const getValidityPercentage = (validity: { notBefore: Date; notAfter: Date }) => {
  const total = validity.notAfter.getTime() - validity.notBefore.getTime()
  const elapsed = Date.now() - validity.notBefore.getTime()
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

/**
 * 获取有效期颜色
 */
const getValidityColor = (validity: { notBefore: Date; notAfter: Date }) => {
  const percentage = getValidityPercentage(validity)
  if (percentage > 90) return '#f56c6c'
  if (percentage > 75) return '#e6a23c'
  return '#67c23a'
}

/**
 * 复制证书
 */
const copyCertificate = async () => {
  if (!generatedCert.value) return
  
  try {
    await navigator.clipboard.writeText(generatedCert.value.certificate)
    ElMessage.success('证书已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

/**
 * 复制私钥
 */
const copyPrivateKey = async () => {
  if (!generatedCert.value) return
  
  try {
    await navigator.clipboard.writeText(generatedCert.value.privateKey)
    ElMessage.success('私钥已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

/**
 * 下载证书
 */
const downloadCertificate = () => {
  if (!generatedCert.value) return
  
  const blob = new Blob([generatedCert.value.certificate], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${generateForm.value.commonName || 'certificate'}.crt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 下载私钥
 */
const downloadPrivateKey = () => {
  if (!generatedCert.value) return
  
  const blob = new Blob([generatedCert.value.privateKey], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${generateForm.value.commonName || 'certificate'}.key`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 下载证书包
 */
const downloadBundle = () => {
  if (!generatedCert.value) return
  
  const bundle = `${generatedCert.value.certificate}\n${generatedCert.value.privateKey}`
  const blob = new Blob([bundle], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${generateForm.value.commonName || 'certificate'}-bundle.pem`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
.result-section {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.input-section h3,
.result-section h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.input-tips {
  margin-top: 0.5rem;
}

.cert-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.serial-number {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.validity-progress {
  margin-top: 1rem;
}

.domains-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.domain-tag {
  margin: 0;
}

.extension-content {
  background: #f5f7fa;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-display,
.empty-display {
  padding: 2rem;
  text-align: center;
}

.verify-section,
.generate-section {
  padding: 1rem;
}

.verify-input,
.generate-form {
  margin-bottom: 2rem;
}

.verify-input h3,
.generate-form h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.verify-result {
  margin-top: 2rem;
}

.verify-result h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.verify-status {
  text-align: center;
}

.verify-details {
  margin-top: 1rem;
}

.verify-errors {
  margin-top: 1rem;
}

.verify-errors h4 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1rem;
  font-weight: 600;
}

.verify-errors .el-alert {
  margin-bottom: 0.5rem;
}

.generated-result {
  margin-top: 2rem;
}

.generated-result h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.cert-output {
  position: relative;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e4e7ed;
}

.cert-content {
  background: #f5f7fa;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.download-actions {
  margin-top: 1rem;
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
  
  .domains-list {
    flex-direction: column;
  }
  
  .output-header {
    flex-direction: column;
    gap: 0.5rem;
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
  
  .cert-content {
    font-size: 0.8rem;
  }
}
</style>