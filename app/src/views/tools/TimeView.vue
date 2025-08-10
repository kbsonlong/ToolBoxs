<template>
  <div class="tool-container">
    <div class="tool-header">
      <h1>
        <el-icon><Clock /></el-icon>
        时间格式转换
      </h1>
      <p>时间戳转换、格式化和时区处理工具</p>
    </div>

    <el-card class="tool-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 时间戳转换 -->
        <el-tab-pane label="时间戳转换" name="timestamp">
          <div class="timestamp-section">
            <div class="current-time">
              <el-card class="time-card">
                <div class="time-display">
                  <h3>当前时间</h3>
                  <div class="time-info">
                    <div class="time-item">
                      <span class="time-label">本地时间:</span>
                      <span class="time-value">{{ currentTime.local }}</span>
                    </div>
                    <div class="time-item">
                      <span class="time-label">UTC时间:</span>
                      <span class="time-value">{{ currentTime.utc }}</span>
                    </div>
                    <div class="time-item">
                      <span class="time-label">时间戳(秒):</span>
                      <span class="time-value timestamp">{{ currentTime.timestamp }}</span>
                      <el-button @click="copyText(currentTime.timestamp.toString())" :icon="DocumentCopy" size="small" text />
                    </div>
                    <div class="time-item">
                      <span class="time-label">时间戳(毫秒):</span>
                      <span class="time-value timestamp">{{ currentTime.timestampMs }}</span>
                      <el-button @click="copyText(currentTime.timestampMs.toString())" :icon="DocumentCopy" size="small" text />
                    </div>
                  </div>
                </div>
              </el-card>
            </div>

            <div class="converter-section">
              <el-row :gutter="20">
                <el-col :xs="24" :md="12">
                  <div class="input-section">
                    <h3>时间戳转日期</h3>
                    <el-space direction="vertical" fill style="width: 100%">
                      <el-input
                        v-model="timestampInput"
                        placeholder="请输入时间戳（支持秒或毫秒）"
                        @input="convertTimestamp"
                      >
                        <template #prepend>时间戳</template>
                        <template #append>
                          <el-button @click="useCurrentTimestamp" size="small">当前</el-button>
                        </template>
                      </el-input>
                      
                      <el-radio-group v-model="timestampUnit" @change="convertTimestamp">
                        <el-radio value="seconds">秒</el-radio>
                        <el-radio value="milliseconds">毫秒</el-radio>
                        <el-radio value="auto">自动检测</el-radio>
                      </el-radio-group>
                    </el-space>
                    
                    <div class="result-section" v-if="timestampResult">
                      <el-descriptions :column="1" border>
                        <el-descriptions-item label="本地时间">
                          {{ timestampResult.local }}
                          <el-button @click="copyText(timestampResult.local)" :icon="DocumentCopy" size="small" text />
                        </el-descriptions-item>
                        <el-descriptions-item label="UTC时间">
                          {{ timestampResult.utc }}
                          <el-button @click="copyText(timestampResult.utc)" :icon="DocumentCopy" size="small" text />
                        </el-descriptions-item>
                        <el-descriptions-item label="ISO格式">
                          {{ timestampResult.iso }}
                          <el-button @click="copyText(timestampResult.iso)" :icon="DocumentCopy" size="small" text />
                        </el-descriptions-item>
                        <el-descriptions-item label="相对时间">
                          {{ timestampResult.relative }}
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>
                  </div>
                </el-col>
                
                <el-col :xs="24" :md="12">
                  <div class="input-section">
                    <h3>日期转时间戳</h3>
                    <el-space direction="vertical" fill style="width: 100%">
                      <el-date-picker
                        v-model="dateInput"
                        type="datetime"
                        placeholder="选择日期时间"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%"
                        @change="convertDate"
                      />
                      
                      <el-input
                        v-model="dateStringInput"
                        placeholder="或输入日期字符串（如：2024-01-01 12:00:00）"
                        @input="convertDateString"
                      >
                        <template #prepend>日期字符串</template>
                      </el-input>
                    </el-space>
                    
                    <div class="result-section" v-if="dateResult">
                      <el-descriptions :column="1" border>
                        <el-descriptions-item label="时间戳(秒)">
                          {{ dateResult.timestamp }}
                          <el-button @click="copyText(dateResult.timestamp.toString())" :icon="DocumentCopy" size="small" text />
                        </el-descriptions-item>
                        <el-descriptions-item label="时间戳(毫秒)">
                          {{ dateResult.timestampMs }}
                          <el-button @click="copyText(dateResult.timestampMs.toString())" :icon="DocumentCopy" size="small" text />
                        </el-descriptions-item>
                        <el-descriptions-item label="ISO格式">
                          {{ dateResult.iso }}
                          <el-button @click="copyText(dateResult.iso)" :icon="DocumentCopy" size="small" text />
                        </el-descriptions-item>
                        <el-descriptions-item label="UTC时间">
                          {{ dateResult.utc }}
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- 时间格式化 -->
        <el-tab-pane label="时间格式化" name="format">
          <div class="format-section">
            <div class="input-section">
              <h3>时间输入</h3>
              <el-space direction="vertical" fill style="width: 100%">
                <el-date-picker
                  v-model="formatDateInput"
                  type="datetime"
                  placeholder="选择要格式化的日期时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  @change="updateFormattedResults"
                />
                
                <el-input
                  v-model="customFormat"
                  placeholder="自定义格式（如：YYYY年MM月DD日 HH:mm:ss）"
                  @input="updateFormattedResults"
                >
                  <template #prepend>自定义格式</template>
                </el-input>
              </el-space>
            </div>
            
            <div class="format-results" v-if="formatDateInput">
              <h3>格式化结果</h3>
              <el-space direction="vertical" fill style="width: 100%">
                <el-input v-for="format in commonFormats" :key="format.label" :value="format.result" readonly>
                  <template #prepend>{{ format.label }}</template>
                  <template #append>
                    <el-button @click="copyText(format.result)" :icon="DocumentCopy" size="small" />
                  </template>
                </el-input>
                
                <el-input v-if="customFormatResult" :value="customFormatResult" readonly>
                  <template #prepend>自定义格式</template>
                  <template #append>
                    <el-button @click="copyText(customFormatResult)" :icon="DocumentCopy" size="small" />
                  </template>
                </el-input>
              </el-space>
            </div>
            
            <div class="format-help">
              <el-divider content-position="left">格式说明</el-divider>
              <el-row :gutter="16">
                <el-col :xs="24" :sm="12" :md="8" v-for="help in formatHelp" :key="help.token">
                  <el-card class="help-card">
                    <div class="help-item">
                      <code>{{ help.token }}</code>
                      <span>{{ help.description }}</span>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- 时区转换 -->
        <el-tab-pane label="时区转换" name="timezone">
          <div class="timezone-section">
            <div class="input-section">
              <h3>时区转换</h3>
              <el-row :gutter="20">
                <el-col :xs="24" :md="8">
                  <el-date-picker
                    v-model="timezoneInput"
                    type="datetime"
                    placeholder="选择时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                    @change="convertTimezones"
                  />
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-select v-model="sourceTimezone" placeholder="源时区" style="width: 100%" @change="convertTimezones">
                    <el-option v-for="tz in commonTimezones" :key="tz.value" :label="tz.label" :value="tz.value" />
                  </el-select>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-select v-model="targetTimezone" placeholder="目标时区" style="width: 100%" @change="convertTimezones">
                    <el-option v-for="tz in commonTimezones" :key="tz.value" :label="tz.label" :value="tz.value" />
                  </el-select>
                </el-col>
              </el-row>
            </div>
            
            <div class="timezone-results" v-if="timezoneResults.length > 0">
              <h3>时区转换结果</h3>
              <el-table :data="timezoneResults" border>
                <el-table-column prop="timezone" label="时区" width="200" />
                <el-table-column prop="time" label="时间" min-width="200" />
                <el-table-column prop="offset" label="UTC偏移" width="120" />
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button @click="copyText(row.time)" :icon="DocumentCopy" size="small" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <div class="world-clock">
              <el-divider content-position="left">世界时钟</el-divider>
              <el-row :gutter="16">
                <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="clock in worldClocks" :key="clock.timezone">
                  <el-card class="clock-card">
                    <div class="clock-info">
                      <h4>{{ clock.city }}</h4>
                      <div class="clock-time">{{ clock.time }}</div>
                      <div class="clock-date">{{ clock.date }}</div>
                      <div class="clock-offset">{{ clock.offset }}</div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Clock,
  DocumentCopy
} from '@element-plus/icons-vue'
import {
  formatTimestamp,
  parseDateTime,
  getRelativeTime,
  formatTimeWithPattern,
  getTimezoneOffset,
  TIME_FORMATS
} from '@/services/timeService'

// 响应式数据
const activeTab = ref('timestamp')
const currentTime = ref({
  local: '',
  utc: '',
  timestamp: 0,
  timestampMs: 0
})
const timestampInput = ref('')
const timestampUnit = ref('auto')
const timestampResult = ref<any>(null)
const dateInput = ref('')
const dateStringInput = ref('')
const dateResult = ref<any>(null)
const formatDateInput = ref<Date | null>(null)
const customFormat = ref('YYYY年MM月DD日 HH:mm:ss')
const timezoneInput = ref<Date | null>(null)
const sourceTimezone = ref('Asia/Shanghai')
const targetTimezone = ref('America/New_York')
const timezoneResults = ref<any[]>([])
const worldClocks = ref<any[]>([])

let timer: number | null = null

// 常用时区
const commonTimezones = [
  { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
  { label: '纽约时间 (UTC-5/-4)', value: 'America/New_York' },
  { label: '伦敦时间 (UTC+0/+1)', value: 'Europe/London' },
  { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
  { label: '悉尼时间 (UTC+10/+11)', value: 'Australia/Sydney' },
  { label: '洛杉矶时间 (UTC-8/-7)', value: 'America/Los_Angeles' },
  { label: '巴黎时间 (UTC+1/+2)', value: 'Europe/Paris' },
  { label: '莫斯科时间 (UTC+3)', value: 'Europe/Moscow' },
  { label: '迪拜时间 (UTC+4)', value: 'Asia/Dubai' },
  { label: 'UTC时间', value: 'UTC' }
]

// 常用格式
const commonFormats = computed(() => {
  if (!formatDateInput.value) return []
  
  const date = new Date(formatDateInput.value)
  const timestamp = Math.floor(date.getTime() / 1000)
  return [
    { label: 'YYYY-MM-DD', result: formatTimeWithPattern(timestamp, 'YYYY-MM-DD') },
    { label: 'YYYY/MM/DD', result: formatTimeWithPattern(timestamp, 'YYYY/MM/DD') },
    { label: 'MM/DD/YYYY', result: formatTimeWithPattern(timestamp, 'MM/DD/YYYY') },
    { label: 'DD/MM/YYYY', result: formatTimeWithPattern(timestamp, 'DD/MM/YYYY') },
    { label: 'YYYY-MM-DD HH:mm:ss', result: formatTimeWithPattern(timestamp, 'YYYY-MM-DD HH:mm:ss') },
    { label: 'MM/DD/YYYY HH:mm:ss', result: formatTimeWithPattern(timestamp, 'MM/DD/YYYY HH:mm:ss') },
    { label: 'YYYY年MM月DD日', result: formatTimeWithPattern(timestamp, 'YYYY年MM月DD日') },
    { label: 'MM月DD日 HH:mm', result: formatTimeWithPattern(timestamp, 'MM月DD日 HH:mm') },
    { label: 'HH:mm:ss', result: formatTimeWithPattern(timestamp, 'HH:mm:ss') },
    { label: 'ISO格式', result: date.toISOString() }
  ]
})

// 自定义格式结果
const customFormatResult = computed(() => {
  if (!formatDateInput.value || !customFormat.value) return ''
  
  try {
    const date = new Date(formatDateInput.value)
    const timestamp = Math.floor(date.getTime() / 1000)
    return formatTimeWithPattern(timestamp, customFormat.value)
  } catch {
    return '格式错误'
  }
})

// 格式帮助
const formatHelp = [
  { token: 'YYYY', description: '四位年份' },
  { token: 'YY', description: '两位年份' },
  { token: 'MM', description: '月份(01-12)' },
  { token: 'DD', description: '日期(01-31)' },
  { token: 'HH', description: '小时(00-23)' },
  { token: 'mm', description: '分钟(00-59)' },
  { token: 'ss', description: '秒(00-59)' },
  { token: 'SSS', description: '毫秒(000-999)' },
  { token: 'A', description: 'AM/PM' },
  { token: 'Z', description: '时区偏移' }
]

// 生命周期
onMounted(() => {
  updateCurrentTime()
  updateWorldClocks()
  timer = window.setInterval(() => {
    updateCurrentTime()
    updateWorldClocks()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

/**
 * 更新当前时间
 */
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = {
    local: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    utc: now.toUTCString(),
    timestamp: Math.floor(now.getTime() / 1000),
    timestampMs: now.getTime()
  }
}

/**
 * 更新世界时钟
 */
const updateWorldClocks = () => {
  const now = new Date()
  const clocks = [
    { city: '北京', timezone: 'Asia/Shanghai' },
    { city: '纽约', timezone: 'America/New_York' },
    { city: '伦敦', timezone: 'Europe/London' },
    { city: '东京', timezone: 'Asia/Tokyo' },
    { city: '悉尼', timezone: 'Australia/Sydney' },
    { city: '洛杉矶', timezone: 'America/Los_Angeles' }
  ]
  
  worldClocks.value = clocks.map(clock => {
    try {
      const time = now.toLocaleTimeString('zh-CN', { timeZone: clock.timezone })
      const date = now.toLocaleDateString('zh-CN', { timeZone: clock.timezone })
      const offset = getTimezoneOffset(clock.timezone)
      
      return {
        ...clock,
        time,
        date,
        offset: `UTC${offset >= 0 ? '+' : ''}${offset}`
      }
    } catch {
      return {
        ...clock,
        time: '--:--:--',
        date: '----/--/--',
        offset: 'N/A'
      }
    }
  })
}

/**
 * 转换时间戳
 */
const convertTimestamp = () => {
  if (!timestampInput.value) {
    timestampResult.value = null
    return
  }
  
  try {
    let timestamp = parseInt(timestampInput.value)
    
    // 自动检测单位
    if (timestampUnit.value === 'auto') {
      // 如果数字长度大于10位，认为是毫秒
      if (timestampInput.value.length > 10) {
        timestamp = timestamp / 1000
      }
    } else if (timestampUnit.value === 'milliseconds') {
      timestamp = timestamp / 1000
    }
    
    const result = formatTimestamp(timestamp)
    timestampResult.value = {
      ...result,
      relative: getRelativeTime(new Date(timestamp * 1000))
    }
  } catch (error) {
    console.error('时间戳转换失败:', error)
    timestampResult.value = null
    ElMessage.error('无效的时间戳格式')
  }
}

/**
 * 使用当前时间戳
 */
const useCurrentTimestamp = () => {
  timestampInput.value = currentTime.value.timestamp.toString()
  convertTimestamp()
}

/**
 * 转换日期
 */
const convertDate = () => {
  if (!dateInput.value) {
    dateResult.value = null
    return
  }
  
  try {
    const date = new Date(dateInput.value)
    const timestamp = Math.floor(date.getTime() / 1000)
    
    dateResult.value = {
      timestamp,
      timestampMs: date.getTime(),
      iso: date.toISOString(),
      utc: date.toUTCString()
    }
  } catch (error) {
    console.error('日期转换失败:', error)
    dateResult.value = null
    ElMessage.error('无效的日期格式')
  }
}

/**
 * 转换日期字符串
 */
const convertDateString = () => {
  if (!dateStringInput.value) {
    dateResult.value = null
    return
  }
  
  try {
    const result = parseDateTime(dateStringInput.value)
    const date = new Date(result.timestamp * 1000)
    
    dateResult.value = {
      timestamp: result.timestamp,
      timestampMs: date.getTime(),
      iso: date.toISOString(),
      utc: date.toUTCString()
    }
  } catch (error) {
    console.error('日期字符串转换失败:', error)
    dateResult.value = null
    ElMessage.error('无效的日期字符串格式')
  }
}

/**
 * 更新格式化结果
 */
const updateFormattedResults = () => {
  // 格式化结果通过计算属性自动更新
}

/**
 * 转换时区
 */
const convertTimezones = () => {
  if (!timezoneInput.value) {
    timezoneResults.value = []
    return
  }
  
  try {
    const date = new Date(timezoneInput.value)
    const results: Array<{
      timezone: string
      time: string
      offset: string
    }> = []
    
    // 添加源时区和目标时区
    const timezones = [sourceTimezone.value, targetTimezone.value]
    const uniqueTimezones = [...new Set(timezones)]
    
    uniqueTimezones.forEach(tz => {
      try {
        const time = date.toLocaleString('zh-CN', { timeZone: tz })
        const offset = getTimezoneOffset(tz)
        
        results.push({
          timezone: commonTimezones.find(t => t.value === tz)?.label || tz,
          time,
          offset: `UTC${offset >= 0 ? '+' : ''}${offset}`
        })
      } catch (error) {
        console.error(`时区转换失败 ${tz}:`, error)
      }
    })
    
    timezoneResults.value = results
  } catch (error) {
    console.error('时区转换失败:', error)
    timezoneResults.value = []
    ElMessage.error('时区转换失败')
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

.current-time {
  margin-bottom: 2rem;
}

.time-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.time-display h3 {
  margin: 0 0 1rem 0;
  text-align: center;
  font-size: 1.5rem;
}

.time-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.time-label {
  font-weight: 600;
  min-width: 100px;
}

.time-value {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.time-value.timestamp {
  color: #ffd700;
  font-weight: 600;
}

.converter-section,
.format-section,
.timezone-section {
  margin-bottom: 2rem;
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

.result-section {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.format-results {
  margin: 2rem 0;
}

.format-results h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.format-help {
  margin-top: 2rem;
}

.help-card {
  height: 100%;
  border-radius: 8px;
}

.help-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
}

.help-item code {
  background: #f1f2f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  color: #e6a23c;
}

.timezone-results {
  margin: 2rem 0;
}

.timezone-results h3 {
  margin: 0 0 1rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.world-clock {
  margin-top: 2rem;
}

.clock-card {
  text-align: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.clock-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.clock-info h4 {
  margin: 0 0 0.5rem 0;
  color: #303133;
  font-size: 1.1rem;
}

.clock-time {
  font-size: 1.5rem;
  font-weight: 600;
  color: #409eff;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  margin-bottom: 0.25rem;
}

.clock-date {
  color: #606266;
  margin-bottom: 0.25rem;
}

.clock-offset {
  font-size: 0.9rem;
  color: #909399;
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
  
  .time-info {
    grid-template-columns: 1fr;
  }
  
  .time-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time-label {
    min-width: auto;
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