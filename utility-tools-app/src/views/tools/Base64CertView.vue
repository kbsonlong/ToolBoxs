<template>
  <div class="tool-container">
    <div class="tool-header">
      <h1>
        <el-icon><Document /></el-icon>
        Base64证书解析
      </h1>
      <p>解析和转换Base64编码的证书文件</p>
    </div>

    <el-card class="tool-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 证书解析 -->
        <el-tab-pane label="证书解析" name="parse">
          <div class="parse-section">
            <el-row :gutter="20">
              <el-col :xs="24" :lg="12">
                <div class="input-section">
                  <h3>Base64证书输入</h3>
                  
                  <el-form label-width="100px">
                    <el-form-item label="输入方式">
                      <el-radio-group v-model="inputMethod" @change="clearResults">
                        <el-radio label="text">Base64文本</el-radio>
                        <el-radio label="file">证书文件</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    
                    <!-- Base64文本输入 -->
                    <el-form-item label="Base64内容" v-if="inputMethod === 'text'">
                      <el-input
                        v-model="base64Input"
                        type="textarea"
                        :rows="8"
                        placeholder="请粘贴Base64编码的证书内容&#10;支持带或不带PEM头尾的格式&#10;&#10;例如：&#10;-----BEGIN CERTIFICATE-----&#10;MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV...&#10;-----END CERTIFICATE-----&#10;&#10;或直接Base64字符串：&#10;MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV..."
                        @input="parseBase64Certificate"
                        maxlength="50000"
                        show-word-limit
                      />
                      <div class="input-tips">
                        <el-text size="small" type="info">
                          支持PEM格式或纯Base64字符串
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
                        accept=".crt,.cer,.pem,.p7b,.p7c,.der,.txt"
                        @change="handleFileChange"
                        drag
                      >
                        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                        <div class="el-upload__text">
                          拖拽文件到此处或<em>点击上传</em>
                        </div>
                        <template #tip>
                          <div class="el-upload__tip">
                            支持 .crt, .cer, .pem, .p7b, .p7c, .der, .txt 格式
                          </div>
                        </template>
                      </el-upload>
                    </el-form-item>
                    
                    <!-- 操作按钮 -->
                    <el-form-item>
                      <el-space>
                        <el-button @click="clearInput" :icon="Delete">
                          清空
                        </el-button>
                        <el-button @click="loadSample" :icon="Document">
                          加载示例
                        </el-button>
                        <el-button @click="validateBase64" :icon="Check">
                          验证格式
                        </el-button>
                      </el-space>
                    </el-form-item>
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
                          <span>证书信息</span>
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
                        <el-descriptions-item label="版本">
                          <el-text>{{ certInfo.version }}</el-text>
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
                    
                    <!-- 主体信息 -->
                    <el-card class="info-card" shadow="never">
                      <template #header>
                        <span>主体信息</span>
                      </template>
                      
                      <el-descriptions :column="1" size="small">
                        <el-descriptions-item label="通用名称" v-if="certInfo.subject.commonName">
                          <el-text>{{ certInfo.subject.commonName }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="组织" v-if="certInfo.subject.organization">
                          <el-text>{{ certInfo.subject.organization }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="组织单位" v-if="certInfo.subject.organizationalUnit">
                          <el-text>{{ certInfo.subject.organizationalUnit }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="国家" v-if="certInfo.subject.country">
                          <el-text>{{ certInfo.subject.country }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="省份" v-if="certInfo.subject.state">
                          <el-text>{{ certInfo.subject.state }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="城市" v-if="certInfo.subject.locality">
                          <el-text>{{ certInfo.subject.locality }}</el-text>
                        </el-descriptions-item>
                      </el-descriptions>
                    </el-card>
                    
                    <!-- 颁发者信息 -->
                    <el-card class="info-card" shadow="never">
                      <template #header>
                        <span>颁发者信息</span>
                      </template>
                      
                      <el-descriptions :column="1" size="small">
                        <el-descriptions-item label="通用名称" v-if="certInfo.issuer.commonName">
                          <el-text>{{ certInfo.issuer.commonName }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="组织" v-if="certInfo.issuer.organization">
                          <el-text>{{ certInfo.issuer.organization }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="组织单位" v-if="certInfo.issuer.organizationalUnit">
                          <el-text>{{ certInfo.issuer.organizationalUnit }}</el-text>
                        </el-descriptions-item>
                        <el-descriptions-item label="国家" v-if="certInfo.issuer.country">
                          <el-text>{{ certInfo.issuer.country }}</el-text>
                        </el-descriptions-item>
                      </el-descriptions>
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
                    
                    <!-- 指纹信息 -->
                    <el-card class="info-card" shadow="never">
                      <template #header>
                        <span>指纹信息</span>
                      </template>
                      
                      <el-descriptions :column="1" size="small">
                        <el-descriptions-item label="SHA-1">
                          <el-text class="fingerprint">{{ certInfo.fingerprints.sha1 }}</el-text>
                          <el-button @click="copyFingerprint(certInfo.fingerprints.sha1)" :icon="DocumentCopy" size="small" text />
                        </el-descriptions-item>
                        <el-descriptions-item label="SHA-256">
                          <el-text class="fingerprint">{{ certInfo.fingerprints.sha256 }}</el-text>
                          <el-button @click="copyFingerprint(certInfo.fingerprints.sha256)" :icon="DocumentCopy" size="small" text />
                        </el-descriptions-item>
                      </el-descriptions>
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
                    <el-empty description="请输入Base64证书内容进行解析" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 格式转换 -->
        <el-tab-pane label="格式转换" name="convert">
          <div class="convert-section">
            <div class="convert-input">
              <h3>证书格式转换</h3>
              
              <el-form label-width="120px">
                <el-form-item label="输入格式">
                  <el-select v-model="convertForm.inputFormat" style="width: 200px">
                    <el-option label="PEM (Base64)" value="pem" />
                    <el-option label="DER (Binary)" value="der" />
                    <el-option label="PKCS#7" value="p7b" />
                    <el-option label="PKCS#12" value="p12" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="输出格式">
                  <el-select v-model="convertForm.outputFormat" style="width: 200px">
                    <el-option label="PEM (Base64)" value="pem" />
                    <el-option label="DER (Binary)" value="der" />
                    <el-option label="PKCS#7" value="p7b" />
                    <el-option label="Text (可读)" value="text" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="证书内容">
                  <el-input
                    v-model="convertForm.input"
                    type="textarea"
                    :rows="6"
                    placeholder="请输入要转换的证书内容"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-space>
                    <el-button type="primary" @click="convertCertificate" :loading="converting">
                      {{ converting ? '转换中...' : '转换格式' }}
                    </el-button>
                    <el-button @click="clearConvertForm" :icon="Delete">
                      清空
                    </el-button>
                  </el-space>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="convertResult" class="convert-result">
              <h3>转换结果</h3>
              
              <el-card shadow="never">
                <template #header>
                  <div class="result-header">
                    <span>{{ getFormatLabel(convertForm.outputFormat) }}</span>
                    <el-space>
                      <el-button @click="copyConvertResult" :icon="DocumentCopy" size="small">
                        复制
                      </el-button>
                      <el-button @click="downloadConvertResult" :icon="Download" size="small">
                        下载
                      </el-button>
                    </el-space>
                  </div>
                </template>
                
                <div class="convert-output">
                  <pre v-if="convertForm.outputFormat === 'text'" class="text-output">{{ convertResult }}</pre>
                  <el-input
                    v-else
                    v-model="convertResult"
                    type="textarea"
                    :rows="10"
                    readonly
                    class="result-textarea"
                  />
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- 批量处理 -->
        <el-tab-pane label="批量处理" name="batch">
          <div class="batch-section">
            <div class="batch-input">
              <h3>批量证书解析</h3>
              
              <el-form label-width="100px">
                <el-form-item label="证书列表">
                  <el-input
                    v-model="batchInput"
                    type="textarea"
                    :rows="8"
                    placeholder="每个证书用空行分隔，支持PEM格式&#10;&#10;-----BEGIN CERTIFICATE-----&#10;证书1内容...&#10;-----END CERTIFICATE-----&#10;&#10;-----BEGIN CERTIFICATE-----&#10;证书2内容...&#10;-----END CERTIFICATE-----"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-space>
                    <el-button type="primary" @click="batchParseCertificates" :loading="batchProcessing">
                      {{ batchProcessing ? '处理中...' : '批量解析' }}
                    </el-button>
                    <el-button @click="clearBatchResults" :disabled="batchResults.length === 0">
                      清空结果
                    </el-button>
                    <el-button @click="exportBatchResults" :disabled="batchResults.length === 0" :icon="Download">
                      导出结果
                    </el-button>
                  </el-space>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="batchResults.length > 0" class="batch-results">
              <h3>批量处理结果 ({{ batchResults.length }} 个)</h3>
              
              <div class="batch-summary">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-statistic title="总数" :value="batchResults.length" />
                  </el-col>
                  <el-col :span="6">
                    <el-statistic title="有效" :value="batchResults.filter(r => r.success && r.certInfo?.validity.isValid).length" />
                  </el-col>
                  <el-col :span="6">
                    <el-statistic title="过期" :value="batchResults.filter(r => r.success && !r.certInfo?.validity.isValid).length" />
                  </el-col>
                  <el-col :span="6">
                    <el-statistic title="错误" :value="batchResults.filter(r => !r.success).length" />
                  </el-col>
                </el-row>
              </div>
              
              <el-table :data="batchResults" stripe style="width: 100%">
                <el-table-column prop="index" label="序号" width="80" />
                <el-table-column label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.success ? 'success' : 'danger'">
                      {{ row.success ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="通用名称" min-width="200">
                  <template #default="{ row }">
                    <el-text v-if="row.success && row.certInfo">
                      {{ row.certInfo.subject.commonName || 'N/A' }}
                    </el-text>
                    <el-text v-else type="danger">{{ row.error }}</el-text>
                  </template>
                </el-table-column>
                <el-table-column label="颁发者" min-width="200">
                  <template #default="{ row }">
                    <el-text v-if="row.success && row.certInfo">
                      {{ row.certInfo.issuer.commonName || 'N/A' }}
                    </el-text>
                  </template>
                </el-table-column>
                <el-table-column label="有效期" width="120">
                  <template #default="{ row }">
                    <el-tag
                      v-if="row.success && row.certInfo"
                      :type="getValidityType(row.certInfo.validity.isValid)"
                    >
                      {{ row.certInfo.validity.isValid ? '有效' : '无效' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="剩余天数" width="120">
                  <template #default="{ row }">
                    <el-text
                      v-if="row.success && row.certInfo"
                      :type="getDaysLeftType(row.certInfo.validity.daysLeft)"
                    >
                      {{ row.certInfo.validity.daysLeft }} 天
                    </el-text>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button
                      v-if="row.success"
                      @click="viewBatchDetail(row)"
                      :icon="View"
                      size="small"
                      text
                    >
                      详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="证书详情"
      width="80%"
      :before-close="closeDetailDialog"
    >
      <div v-if="selectedCert" class="cert-detail">
        <!-- 这里可以复用证书信息显示组件 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="通用名称">
            {{ selectedCert.subject.commonName || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="颁发者">
            {{ selectedCert.issuer.commonName || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="序列号">
            {{ selectedCert.serialNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="签名算法">
            {{ selectedCert.signatureAlgorithm }}
          </el-descriptions-item>
          <el-descriptions-item label="生效时间">
            {{ formatDate(selectedCert.validity.notBefore) }}
          </el-descriptions-item>
          <el-descriptions-item label="过期时间">
            {{ formatDate(selectedCert.validity.notAfter) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  UploadFilled,
  DocumentCopy,
  Download,
  Delete,
  Check,
  View
} from '@element-plus/icons-vue'
import {
  parseBase64Certificate as parseBase64CertUtil,
  convertCertificateFormat
} from '@/services/tlsService'
import type { CertificateInfo } from '@/services/tlsService'
import { formatDate } from '@/utils/formatters'
import { isValidBase64 } from '@/utils/validators'

// 响应式数据
const activeTab = ref('parse')
const inputMethod = ref<'text' | 'file'>('text')
const base64Input = ref('')
const certInfo = ref<CertificateInfo | null>(null)
const parseError = ref('')

// 格式转换
const converting = ref(false)
const convertForm = ref({
  inputFormat: 'pem',
  outputFormat: 'text',
  input: ''
})
const convertResult = ref('')

// 批量处理
const batchProcessing = ref(false)
const batchInput = ref('')
const batchResults = ref<Array<{
  index: number
  success: boolean
  certInfo?: CertificateInfo
  error?: string
}>>([])

// 详情对话框
const detailDialogVisible = ref(false)
const selectedCert = ref<CertificateInfo | null>(null)

// 方法
/**
 * 解析Base64证书
 */
const parseBase64Certificate = async () => {
  if (!base64Input.value.trim()) {
    certInfo.value = null
    parseError.value = ''
    return
  }
  
  try {
    parseError.value = ''
    certInfo.value = await parseBase64CertUtil(base64Input.value)
  } catch (error) {
    console.error('证书解析失败:', error)
    parseError.value = error instanceof Error ? error.message : '证书解析失败'
    certInfo.value = null
  }
}

/**
 * 处理文件上传
 */
const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    base64Input.value = e.target?.result as string
    parseBase64Certificate()
  }
  reader.readAsText(file.raw)
}

/**
 * 清空输入
 */
const clearInput = () => {
  base64Input.value = ''
  certInfo.value = null
  parseError.value = ''
}

/**
 * 加载示例
 */
const loadSample = () => {
  base64Input.value = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTMwODI3MjM1NDA3WhcNMTQwODI3MjM1NDA3WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAwuqTiuGqAXGHYAg/WQwgwHA6sLb2fG/xIlPNyUCqGqmvnZbTTvx16LnU
5efZRg6ByYb0SOhS5A3mCCQmH7QcT6rKjqHQ7YhHpqA+zCKCQ1aAmqaacmPeJfxZ
wQdxfiVJC+wHrFQHvnAiQDpVP4MlnO+q6+b5f5+5+5+5+5+5+5+5+5+5+5+5+5+5
+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5
+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5
+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5+5
wIDAQABo1AwTjAdBgNVHQ4EFgQUhKs61e4zPiGv2UHQu5YaNGRJeiwwHwYDVR0j
BBgwFoAUhKs61e4zPiGv2UHQu5YaNGRJeiwwDAYDVR0TBAUwAwEB/zANBgkqhkiG
9w0BAQUFAAOCAQEAoSc6Skb4g5bcM7vyDxEBi9loTuCIWQmKUTIBL8MuvzAr
-----END CERTIFICATE-----`
  parseBase64Certificate()
}

/**
 * 验证Base64格式
 */
const validateBase64 = () => {
  if (!base64Input.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  
  // 提取Base64内容（去除PEM头尾）
  let base64Content = base64Input.value
    .replace(/-----BEGIN[^-]+-----/g, '')
    .replace(/-----END[^-]+-----/g, '')
    .replace(/\s/g, '')
  
  if (isValidBase64(base64Content)) {
    ElMessage.success('Base64格式验证通过')
  } else {
    ElMessage.error('Base64格式验证失败')
  }
}

/**
 * 清空结果
 */
const clearResults = () => {
  certInfo.value = null
  parseError.value = ''
  base64Input.value = ''
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
const getValidityPercentage = (validity: any) => {
  const total = validity.notAfter.getTime() - validity.notBefore.getTime()
  const elapsed = Date.now() - validity.notBefore.getTime()
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

/**
 * 获取有效期颜色
 */
const getValidityColor = (validity: any) => {
  const percentage = getValidityPercentage(validity)
  if (percentage > 90) return '#f56c6c'
  if (percentage > 75) return '#e6a23c'
  return '#67c23a'
}

/**
 * 复制指纹
 */
const copyFingerprint = async (fingerprint: string) => {
  try {
    await navigator.clipboard.writeText(fingerprint)
    ElMessage.success('指纹已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

/**
 * 转换证书格式
 */
const convertCertificate = async () => {
  if (!convertForm.value.input.trim()) {
    ElMessage.warning('请输入要转换的证书内容')
    return
  }
  
  converting.value = true
  try {
    convertResult.value = await convertCertificateFormat(
      convertForm.value.input,
      convertForm.value.inputFormat,
      convertForm.value.outputFormat
    )
    ElMessage.success('格式转换成功')
  } catch (error) {
    console.error('格式转换失败:', error)
    ElMessage.error('格式转换失败')
  } finally {
    converting.value = false
  }
}

/**
 * 清空转换表单
 */
const clearConvertForm = () => {
  convertForm.value.input = ''
  convertResult.value = ''
}

/**
 * 获取格式标签
 */
const getFormatLabel = (format: string) => {
  const labels: Record<string, string> = {
    pem: 'PEM格式',
    der: 'DER格式',
    p7b: 'PKCS#7格式',
    p12: 'PKCS#12格式',
    text: '文本格式'
  }
  return labels[format] || format
}

/**
 * 复制转换结果
 */
const copyConvertResult = async () => {
  try {
    await navigator.clipboard.writeText(convertResult.value)
    ElMessage.success('结果已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

/**
 * 下载转换结果
 */
const downloadConvertResult = () => {
  const blob = new Blob([convertResult.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `certificate.${convertForm.value.outputFormat}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 批量解析证书
 */
const batchParseCertificates = async () => {
  if (!batchInput.value.trim()) {
    ElMessage.warning('请输入证书内容')
    return
  }
  
  batchProcessing.value = true
  batchResults.value = []
  
  try {
    // 分割证书（通过空行或PEM边界）
    const certs = batchInput.value
      .split(/(?=-----BEGIN CERTIFICATE-----)|\n\s*\n/)
      .filter(cert => cert.trim())
    
    for (let i = 0; i < certs.length; i++) {
      const cert = certs[i].trim()
      if (!cert) continue
      
      try {
        const certInfo = await parseBase64CertUtil(cert)
        batchResults.value.push({
          index: i + 1,
          success: true,
          certInfo
        })
      } catch (error) {
        batchResults.value.push({
          index: i + 1,
          success: false,
          error: error instanceof Error ? error.message : '解析失败'
        })
      }
      
      // 添加小延迟避免阻塞UI
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
    
    ElMessage.success(`批量处理完成，共处理 ${batchResults.value.length} 个证书`)
  } catch (error) {
    console.error('批量处理失败:', error)
    ElMessage.error('批量处理失败')
  } finally {
    batchProcessing.value = false
  }
}

/**
 * 清空批量结果
 */
const clearBatchResults = () => {
  batchResults.value = []
  batchInput.value = ''
}

/**
 * 导出批量结果
 */
const exportBatchResults = () => {
  const csvContent = [
    ['序号', '状态', '通用名称', '颁发者', '生效时间', '过期时间', '剩余天数', '错误信息'].join(','),
    ...batchResults.value.map(result => [
      result.index,
      result.success ? '成功' : '失败',
      result.certInfo?.subject.commonName || '',
      result.certInfo?.issuer.commonName || '',
      result.certInfo ? formatDate(result.certInfo.validity.notBefore) : '',
      result.certInfo ? formatDate(result.certInfo.validity.notAfter) : '',
      result.certInfo?.validity.daysLeft || '',
      result.error || ''
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `certificate-batch-results-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 查看批量详情
 */
const viewBatchDetail = (row: any) => {
  selectedCert.value = row.certInfo
  detailDialogVisible.value = true
}

/**
 * 关闭详情对话框
 */
const closeDetailDialog = () => {
  detailDialogVisible.value = false
  selectedCert.value = null
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

.serial-number,
.fingerprint {
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

.error-display,
.empty-display {
  padding: 2rem;
  text-align: center;
}

.convert-section,
.batch-section {
  padding: 1rem;
}

.convert-input,
.batch-input {
  margin-bottom: 2rem;
}

.convert-input h3,
.batch-input h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.convert-result {
  margin-top: 2rem;
}

.convert-result h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.convert-output {
  position: relative;
}

.text-output {
  background: #f5f7fa;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
}

.result-textarea {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
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

.batch-summary {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.cert-detail {
  padding: 1rem;
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
  
  .result-header {
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
  
  .text-output,
  .result-textarea {
    font-size: 0.8rem;
  }
}
</style>