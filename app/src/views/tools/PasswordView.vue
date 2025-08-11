<template>
  <div class="tool-container">
    <div class="tool-header">
      <h1>
        <el-icon><Lock /></el-icon>
        密码生成器
      </h1>
      <p>生成安全密码、检测密码强度和批量生成工具</p>
    </div>

    <el-card class="tool-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 密码生成 -->
        <el-tab-pane label="密码生成" name="generate">
          <div class="generate-section">
            <el-row :gutter="20">
              <el-col :xs="24" :lg="12">
                <div class="settings-section">
                  <h3>生成设置</h3>
                  
                  <el-form label-width="120px">
                    <el-form-item label="密码长度">
                      <el-slider
                        v-model="passwordLength"
                        :min="4"
                        :max="128"
                        :step="1"
                        show-input
                        @change="generatePassword"
                      />
                    </el-form-item>
                    
                    <el-form-item label="字符类型">
                      <el-checkbox-group v-model="characterTypes" @change="generatePassword">
                        <el-checkbox value="lowercase">小写字母 (a-z)</el-checkbox>
                        <el-checkbox value="uppercase">大写字母 (A-Z)</el-checkbox>
                        <el-checkbox value="numbers">数字 (0-9)</el-checkbox>
                        <el-checkbox value="symbols">符号 (!@#$%^&*)</el-checkbox>
                        <el-checkbox value="similar">包含相似字符 (0oO1lI)</el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>
                    
                    <el-form-item label="排除字符">
                      <el-input
                        v-model="excludeChars"
                        placeholder="输入要排除的字符"
                        @input="generatePassword"
                      />
                    </el-form-item>
                    
                    <el-form-item label="必须包含">
                      <el-input
                        v-model="mustInclude"
                        placeholder="输入必须包含的字符"
                        @input="generatePassword"
                      />
                    </el-form-item>
                    
                    <el-form-item label="密码模式">
                      <el-select v-model="passwordPattern" @change="generatePassword" style="width: 100%">
                        <el-option label="随机" value="random" />
                        <el-option label="易记忆" value="memorable" />
                        <el-option label="PIN码" value="pin" />
                        <el-option label="十六进制" value="hex" />
                        <el-option label="Base64" value="base64" />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item>
                      <el-space>
                        <el-button type="primary" @click="generatePassword" :icon="RefreshRight">
                          重新生成
                        </el-button>
                        <el-button @click="generateMultiple" :icon="Plus">
                          批量生成
                        </el-button>
                        <el-button @click="usePreset('strong')" :icon="Lock">
                          强密码
                        </el-button>
                        <el-button @click="usePreset('medium')" :icon="WarningFilled">
                          中等密码
                        </el-button>
                      </el-space>
                    </el-form-item>
                  </el-form>
                </div>
              </el-col>
              
              <el-col :xs="24" :lg="12">
                <div class="result-section">
                  <h3>生成结果</h3>
                  
                  <div class="password-display">
                    <el-input
                      v-model="generatedPassword"
                      :type="showPassword ? 'text' : 'password'"
                      readonly
                      class="password-input"
                    >
                      <template #append>
                        <el-button @click="showPassword = !showPassword" :icon="showPassword ? Hide : View" />
                        <el-button @click="copyPassword" :icon="DocumentCopy" />
                        <el-button @click="downloadPassword" :icon="Download" />
                      </template>
                    </el-input>
                  </div>
                  
                  <div class="password-strength" v-if="generatedPassword">
                    <h4>密码强度分析</h4>
                    <div class="strength-meter">
                      <div class="strength-bar">
                        <div 
                          class="strength-fill" 
                          :class="strengthResult.level"
                          :style="{ width: strengthResult.score + '%' }"
                        ></div>
                      </div>
                      <div class="strength-info">
                        <span class="strength-label" :class="strengthResult.level">
                          {{ strengthResult.text }}
                        </span>
                        <span class="strength-score">{{ strengthResult.score }}/100</span>
                      </div>
                    </div>
                    
                    <div class="strength-details">
                      <el-descriptions :column="2" size="small" border>
                        <el-descriptions-item label="长度">{{ generatedPassword.length }} 字符</el-descriptions-item>
                        <el-descriptions-item label="字符类型">{{ strengthResult.types }} 种</el-descriptions-item>
                        <el-descriptions-item label="熵值">{{ strengthResult.entropy.toFixed(2) }} bits</el-descriptions-item>
                        <el-descriptions-item label="破解时间">{{ strengthResult.crackTime }}</el-descriptions-item>
                      </el-descriptions>
                    </div>
                    
                    <div class="strength-suggestions" v-if="strengthResult.suggestions.length > 0">
                      <h5>改进建议</h5>
                      <ul>
                        <li v-for="suggestion in strengthResult.suggestions" :key="suggestion">
                          {{ suggestion }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 密码检测 -->
        <el-tab-pane label="密码检测" name="check">
          <div class="check-section">
            <div class="input-section">
              <h3>密码强度检测</h3>
              <el-input
                v-model="checkPassword"
                type="password"
                placeholder="输入要检测的密码"
                show-password
                @input="checkPasswordStrength"
                class="check-input"
              />
            </div>
            
            <div class="check-results" v-if="checkPassword">
              <div class="strength-analysis">
                <h4>强度分析</h4>
                <div class="strength-meter">
                  <div class="strength-bar">
                    <div 
                      class="strength-fill" 
                      :class="checkStrengthResult.level"
                      :style="{ width: checkStrengthResult.score + '%' }"
                    ></div>
                  </div>
                  <div class="strength-info">
                    <span class="strength-label" :class="checkStrengthResult.level">
                      {{ checkStrengthResult.text }}
                    </span>
                    <span class="strength-score">{{ checkStrengthResult.score }}/100</span>
                  </div>
                </div>
              </div>
              
              <el-row :gutter="20">
                <el-col :xs="24" :md="12">
                  <div class="analysis-details">
                    <h4>详细分析</h4>
                    <el-descriptions :column="1" border>
                      <el-descriptions-item label="密码长度">
                        {{ checkPassword.length }} 字符
                        <el-tag :type="checkPassword.length >= 12 ? 'success' : checkPassword.length >= 8 ? 'warning' : 'danger'" size="small">
                          {{ checkPassword.length >= 12 ? '优秀' : checkPassword.length >= 8 ? '良好' : '不足' }}
                        </el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="字符类型">
                        {{ checkStrengthResult.types }} 种
                        <el-tag :type="checkStrengthResult.types >= 4 ? 'success' : checkStrengthResult.types >= 3 ? 'warning' : 'danger'" size="small">
                          {{ checkStrengthResult.types >= 4 ? '优秀' : checkStrengthResult.types >= 3 ? '良好' : '不足' }}
                        </el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="熵值">
                        {{ checkStrengthResult.entropy.toFixed(2) }} bits
                        <el-tag :type="checkStrengthResult.entropy >= 60 ? 'success' : checkStrengthResult.entropy >= 40 ? 'warning' : 'danger'" size="small">
                          {{ checkStrengthResult.entropy >= 60 ? '优秀' : checkStrengthResult.entropy >= 40 ? '良好' : '不足' }}
                        </el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="破解时间">
                        {{ checkStrengthResult.crackTime }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                </el-col>
                
                <el-col :xs="24" :md="12">
                  <div class="character-analysis">
                    <h4>字符组成</h4>
                    <div class="char-types">
                      <div class="char-type" v-for="type in characterAnalysis" :key="type.name">
                        <div class="char-type-header">
                          <span class="char-type-name">{{ type.name }}</span>
                          <el-tag :type="type.count > 0 ? 'success' : 'info'" size="small">
                            {{ type.count }}
                          </el-tag>
                        </div>
                        <div class="char-type-bar">
                          <div 
                            class="char-type-fill"
                            :style="{ width: (type.count / checkPassword.length * 100) + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
              
              <div class="suggestions-section" v-if="checkStrengthResult.suggestions.length > 0">
                <h4>改进建议</h4>
                <el-alert
                  v-for="suggestion in checkStrengthResult.suggestions"
                  :key="suggestion"
                  :title="suggestion"
                  type="warning"
                  :closable="false"
                  class="suggestion-alert"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 批量生成 -->
        <el-tab-pane label="批量生成" name="batch">
          <div class="batch-section">
            <div class="batch-settings">
              <h3>批量生成设置</h3>
              <el-row :gutter="20">
                <el-col :xs="24" :md="8">
                  <el-form-item label="生成数量">
                    <el-input-number v-model="batchCount" :min="1" :max="1000" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="密码长度">
                    <el-input-number v-model="batchLength" :min="4" :max="128" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="最小强度">
                    <el-select v-model="batchMinStrength" style="width: 100%">
                      <el-option label="弱" value="weak" />
                      <el-option label="中等" value="medium" />
                      <el-option label="强" value="strong" />
                      <el-option label="很强" value="very-strong" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item>
                <el-space>
                  <el-button type="primary" @click="generateBatchPasswords" :loading="batchGenerating">
                    {{ batchGenerating ? '生成中...' : '开始生成' }}
                  </el-button>
                  <el-button @click="clearBatchResults" :disabled="batchPasswords.length === 0">
                    清空结果
                  </el-button>
                  <el-button @click="downloadBatchPasswords" :disabled="batchPasswords.length === 0" :icon="Download">
                    下载列表
                  </el-button>
                </el-space>
              </el-form-item>
            </div>
            
            <div class="batch-results" v-if="batchPasswords.length > 0">
              <h3>生成结果 ({{ batchPasswords.length }} 个)</h3>
              <el-table :data="batchPasswords" border max-height="400">
                <el-table-column type="index" label="#" width="60" />
                <el-table-column prop="password" label="密码" min-width="200">
                  <template #default="{ row }">
                    <div class="password-cell">
                      <span class="password-text" :class="{ 'password-hidden': !row.visible }">
                        {{ row.visible ? row.password : '••••••••••••' }}
                      </span>
                      <el-button @click="row.visible = !row.visible" :icon="row.visible ? Hide : View" size="small" text />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="length" label="长度" width="80" />
                <el-table-column prop="strength" label="强度" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getStrengthTagType(row.strength)" size="small">
                      {{ getStrengthText(row.strength) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-space>
                      <el-button @click="copyText(row.password)" :icon="DocumentCopy" size="small" />
                      <el-button @click="removeBatchPassword(row.id)" :icon="Delete" size="small" type="danger" />
                    </el-space>
                  </template>
                </el-table-column>
              </el-table>
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
  Lock,
  RefreshRight,
  Plus,
  WarningFilled,
  View,
  Hide,
  DocumentCopy,
  Download,
  Delete
} from '@element-plus/icons-vue'
import {
  generatePasswords
} from '@/services/cryptoService'

// 密码强度结果类型
interface PasswordStrengthResult {
  score: number
  level: string
  text: string
  types: number
  entropy: number
  crackTime: string
  suggestions: string[]
}

// 密码强度检查函数
function checkPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      level: 'very-weak',
      text: '密码为空',
      types: 0,
      entropy: 0,
      crackTime: '立即',
      suggestions: ['请输入密码']
    }
  }

  let score = 0
  let types = 0
  const suggestions: string[] = []

  // 检查长度
  if (password.length >= 8) score += 1
  else suggestions.push('密码长度至少8位')
  
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // 检查字符类型
  if (/[a-z]/.test(password)) { types += 1; score += 1 }
  else suggestions.push('包含小写字母')
  
  if (/[A-Z]/.test(password)) { types += 1; score += 1 }
  else suggestions.push('包含大写字母')
  
  if (/[0-9]/.test(password)) { types += 1; score += 1 }
  else suggestions.push('包含数字')
  
  if (/[^a-zA-Z0-9]/.test(password)) { types += 1; score += 1 }
  else suggestions.push('包含特殊字符')

  // 检查重复字符
  if (!/(..).*\1/.test(password)) score += 1
  else suggestions.push('避免重复字符模式')

  // 计算熵值（简化版本）
  const charset = types * 26 + (types > 2 ? 10 : 0) + (types > 3 ? 32 : 0)
  const entropy = Math.log2(Math.pow(charset, password.length))

  // 估算破解时间
  let crackTime = '立即'
  if (entropy > 30) crackTime = '几分钟'
  if (entropy > 40) crackTime = '几小时'
  if (entropy > 50) crackTime = '几天'
  if (entropy > 60) crackTime = '几年'
  if (entropy > 70) crackTime = '几十年'
  if (entropy > 80) crackTime = '几个世纪'

  // 确定强度等级
  let level = 'very-weak'
  let text = '非常弱'
  
  if (score >= 2) { level = 'weak'; text = '弱' }
  if (score >= 4) { level = 'medium'; text = '中等' }
  if (score >= 6) { level = 'strong'; text = '强' }
  if (score >= 8) { level = 'very-strong'; text = '非常强' }

  return {
    score,
    level,
    text,
    types,
    entropy: Math.round(entropy),
    crackTime,
    suggestions: suggestions.slice(0, 3)
  }
}

// 单个密码生成函数
function generatePasswordUtil(config: {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
}): string {
  const passwords = generatePasswords({ ...config, quantity: 1 })
  return passwords[0] || ''
}

// 响应式数据
const activeTab = ref('generate')
const passwordLength = ref(16)
const characterTypes = ref(['lowercase', 'uppercase', 'numbers', 'symbols'])
const excludeChars = ref('')
const mustInclude = ref('')
const passwordPattern = ref('random')
const generatedPassword = ref('')
const showPassword = ref(false)
const checkPassword = ref('')
const batchCount = ref(10)
const batchLength = ref(16)
const batchMinStrength = ref('medium')
const batchGenerating = ref(false)
const batchPasswords = ref<Array<{
  id: number
  password: string
  length: number
  strength: string
  visible: boolean
}>>([])

// 计算属性
const strengthResult = computed((): PasswordStrengthResult => {
  if (!generatedPassword.value) {
    return {
      score: 0,
      level: 'very-weak',
      text: '无密码',
      types: 0,
      entropy: 0,
      crackTime: '无',
      suggestions: []
    }
  }
  return checkPasswordStrength(generatedPassword.value)
})

const checkStrengthResult = computed((): PasswordStrengthResult => {
  if (!checkPassword.value) {
    return {
      score: 0,
      level: 'very-weak',
      text: '无密码',
      types: 0,
      entropy: 0,
      crackTime: '无',
      suggestions: []
    }
  }
  return checkPasswordStrength(checkPassword.value)
})

const characterAnalysis = computed(() => {
  if (!checkPassword.value) return []
  
  const password = checkPassword.value
  const lowercase = (password.match(/[a-z]/g) || []).length
  const uppercase = (password.match(/[A-Z]/g) || []).length
  const numbers = (password.match(/[0-9]/g) || []).length
  const symbols = (password.match(/[^a-zA-Z0-9]/g) || []).length
  
  return [
    { name: '小写字母', count: lowercase },
    { name: '大写字母', count: uppercase },
    { name: '数字', count: numbers },
    { name: '符号', count: symbols }
  ]
})

// 监听器
watch(() => [passwordLength.value, characterTypes.value, excludeChars.value, mustInclude.value, passwordPattern.value], () => {
  generatePassword()
}, { deep: true })

// 方法
/**
 * 生成密码
 */
const generatePassword = () => {
  try {
    const options = {
      length: passwordLength.value,
      includeUppercase: characterTypes.value.includes('uppercase'),
      includeLowercase: characterTypes.value.includes('lowercase'),
      includeNumbers: characterTypes.value.includes('numbers'),
      includeSymbols: characterTypes.value.includes('symbols'),
      excludeSimilar: !characterTypes.value.includes('similar'),
      excludeChars: excludeChars.value,
      mustInclude: mustInclude.value,
      pattern: passwordPattern.value
    }
    
    generatedPassword.value = generatePasswordUtil(options)
  } catch (error) {
    console.error('密码生成失败:', error)
    ElMessage.error('密码生成失败')
  }
}

/**
 * 生成多个密码
 */
const generateMultiple = () => {
  const passwords = []
  for (let i = 0; i < 5; i++) {
    generatePassword()
    passwords.push(generatedPassword.value)
  }
  
  const passwordList = passwords.join('\n')
  copyText(passwordList)
  ElMessage.success('已生成5个密码并复制到剪贴板')
}

/**
 * 使用预设
 */
const usePreset = (type: 'strong' | 'medium') => {
  if (type === 'strong') {
    passwordLength.value = 20
    characterTypes.value = ['lowercase', 'uppercase', 'numbers', 'symbols']
    excludeChars.value = ''
    mustInclude.value = ''
    passwordPattern.value = 'random'
  } else {
    passwordLength.value = 12
    characterTypes.value = ['lowercase', 'uppercase', 'numbers']
    excludeChars.value = ''
    mustInclude.value = ''
    passwordPattern.value = 'random'
  }
  generatePassword()
}

/**
 * 复制密码
 */
const copyPassword = () => {
  copyText(generatedPassword.value)
}

/**
 * 下载密码
 */
const downloadPassword = () => {
  const content = `密码: ${generatedPassword.value}\n长度: ${generatedPassword.value.length}\n强度: ${strengthResult.value.text}\n生成时间: ${new Date().toLocaleString()}`
  downloadText(content, 'password.txt')
}

// 密码强度检测已在上方定义

/**
 * 批量生成密码
 */
const generateBatchPasswords = async () => {
  batchGenerating.value = true
  batchPasswords.value = []
  
  try {
    const config = {
      length: batchLength.value,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      quantity: batchCount.value * 2 // 生成更多以便筛选
    }
    
    const passwords = generatePasswords(config)
    
    passwords.forEach((password: string, index: number) => {
      const strengthResult = checkPasswordStrength(password)
      
      // 根据最小强度要求过滤
      const meetRequirement = (() => {
        switch (batchMinStrength.value) {
          case 'weak': return strengthResult.level !== 'very-weak'
          case 'medium': return ['medium', 'strong', 'very-strong'].includes(strengthResult.level)
          case 'strong': return ['strong', 'very-strong'].includes(strengthResult.level)
          default: return true
        }
      })()
      
      if (meetRequirement && batchPasswords.value.length < batchCount.value) {
        batchPasswords.value.push({
          id: Date.now() + index,
          password,
          length: password.length,
          strength: strengthResult.level,
          visible: false
        })
      }
    })
    
    ElMessage.success(`成功生成 ${batchPasswords.value.length} 个密码`)
  } catch (error) {
    console.error('批量生成失败:', error)
    ElMessage.error('批量生成失败')
  } finally {
    batchGenerating.value = false
  }
}

/**
 * 检查密码是否符合最小强度要求
 */
const meetsMinStrength = (password: string, minStrength: string): boolean => {
  const strength = checkPasswordStrength(password)
  const strengthLevels = ['weak', 'medium', 'strong', 'very-strong']
  const currentLevel = strengthLevels.indexOf(strength.level)
  const requiredLevel = strengthLevels.indexOf(minStrength)
  return currentLevel >= requiredLevel
}

/**
 * 清空批量结果
 */
const clearBatchResults = () => {
  batchPasswords.value = []
}

/**
 * 下载批量密码
 */
const downloadBatchPasswords = () => {
  const content = batchPasswords.value.map((item, index) => 
    `${index + 1}. ${item.password} (长度: ${item.length}, 强度: ${getStrengthText(item.strength)})`
  ).join('\n')
  
  const header = `批量生成密码列表\n生成时间: ${new Date().toLocaleString()}\n总数量: ${batchPasswords.value.length}\n\n`
  downloadText(header + content, 'passwords.txt')
}

/**
 * 移除批量密码
 */
const removeBatchPassword = (id: number) => {
  const index = batchPasswords.value.findIndex(item => item.id === id)
  if (index > -1) {
    batchPasswords.value.splice(index, 1)
  }
}

/**
 * 获取强度标签类型
 */
const getStrengthTagType = (strength: string) => {
  switch (strength) {
    case 'very-strong': return 'success'
    case 'strong': return 'success'
    case 'medium': return 'warning'
    case 'weak': return 'danger'
    default: return 'info'
  }
}

/**
 * 获取强度文本
 */
const getStrengthText = (strength: string) => {
  switch (strength) {
    case 'very-strong': return '很强'
    case 'strong': return '强'
    case 'medium': return '中等'
    case 'weak': return '弱'
    default: return '未知'
  }
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

/**
 * 下载文本文件
 */
const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 初始化
generatePassword()
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

.settings-section,
.result-section {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.settings-section h3,
.result-section h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.password-display {
  margin-bottom: 2rem;
}

.password-input {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1.1rem;
}

.password-strength {
  margin-top: 2rem;
}

.password-strength h4 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.1rem;
  font-weight: 600;
}

.strength-meter {
  margin-bottom: 1rem;
}

.strength-bar {
  width: 100%;
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.strength-fill.weak {
  background: #f56c6c;
}

.strength-fill.medium {
  background: #e6a23c;
}

.strength-fill.strong {
  background: #67c23a;
}

.strength-fill.very-strong {
  background: #409eff;
}

.strength-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strength-label {
  font-weight: 600;
}

.strength-label.weak {
  color: #f56c6c;
}

.strength-label.medium {
  color: #e6a23c;
}

.strength-label.strong {
  color: #67c23a;
}

.strength-label.very-strong {
  color: #409eff;
}

.strength-score {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #606266;
}

.strength-details {
  margin: 1rem 0;
}

.strength-suggestions {
  margin-top: 1rem;
}

.strength-suggestions h5 {
  margin: 0 0 0.5rem 0;
  color: #303133;
  font-size: 1rem;
  font-weight: 600;
}

.strength-suggestions ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #606266;
}

.check-section {
  padding: 1rem;
}

.input-section {
  margin-bottom: 2rem;
}

.input-section h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.check-input {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1.1rem;
}

.check-results {
  margin-top: 2rem;
}

.strength-analysis {
  margin-bottom: 2rem;
}

.strength-analysis h4 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.1rem;
  font-weight: 600;
}

.analysis-details,
.character-analysis {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.analysis-details h4,
.character-analysis h4 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.1rem;
  font-weight: 600;
}

.char-types {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.char-type {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.char-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-type-name {
  font-size: 0.9rem;
  color: #606266;
}

.char-type-bar {
  width: 100%;
  height: 4px;
  background: #e4e7ed;
  border-radius: 2px;
  overflow: hidden;
}

.char-type-fill {
  height: 100%;
  background: #409eff;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.suggestions-section {
  margin-top: 2rem;
}

.suggestions-section h4 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.1rem;
  font-weight: 600;
}

.suggestion-alert {
  margin-bottom: 0.5rem;
}

.batch-section {
  padding: 1rem;
}

.batch-settings {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.batch-settings h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
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

.password-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  flex: 1;
}

.password-text.password-hidden {
  letter-spacing: 2px;
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
  
  .settings-section,
  .result-section {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .tool-container {
    padding: 0.5rem;
  }
  
  .tool-header h1 {
    font-size: 1.3rem;
  }
  
  .char-type-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>