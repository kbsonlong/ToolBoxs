/**
 * 格式化工具函数
 * 提供各种数据格式化功能
 */

/**
 * 格式化日期为可读字符串
 * @param date 日期对象
 * @param format 格式类型
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, format: 'full' | 'date' | 'time' | 'iso' = 'full'): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Shanghai'
  }
  
  switch (format) {
    case 'full':
      options.year = 'numeric'
      options.month = '2-digit'
      options.day = '2-digit'
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.second = '2-digit'
      return date.toLocaleString('zh-CN', options)
    
    case 'date':
      options.year = 'numeric'
      options.month = '2-digit'
      options.day = '2-digit'
      return date.toLocaleDateString('zh-CN', options)
    
    case 'time':
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.second = '2-digit'
      return date.toLocaleTimeString('zh-CN', options)
    
    case 'iso':
      return date.toISOString()
    
    default:
      return date.toString()
  }
}

/**
 * 格式化JSON字符串
 * @param jsonStr JSON字符串
 * @param indent 缩进空格数
 * @returns 格式化后的JSON字符串
 */
export function formatJSON(jsonStr: string, indent: number = 2): string {
  try {
    const parsed = JSON.parse(jsonStr)
    return JSON.stringify(parsed, null, indent)
  } catch (error) {
    throw new Error('无效的JSON格式')
  }
}

/**
 * 压缩JSON字符串
 * @param jsonStr JSON字符串
 * @returns 压缩后的JSON字符串
 */
export function minifyJSON(jsonStr: string): string {
  try {
    const parsed = JSON.parse(jsonStr)
    return JSON.stringify(parsed)
  } catch (error) {
    throw new Error('无效的JSON格式')
  }
}

/**
 * 格式化时间戳为人类可读格式
 * @param timestamp Unix时间戳
 * @param timezone 时区
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(
  timestamp: number,
  timezone: string = 'Asia/Shanghai'
): {
  iso: string
  local: string
  utc: string
  relative: string
} {
  const date = new Date(timestamp * 1000)
  
  // ISO格式
  const iso = date.toISOString()
  
  // 本地时间格式
  const local = date.toLocaleString('zh-CN', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  // UTC格式
  const utc = date.toUTCString()
  
  // 相对时间
  const relative = getRelativeTime(date)
  
  return {
    iso,
    local,
    utc,
    relative
  }
}

/**
 * 解析日期时间字符串为时间戳
 * @param dateStr 日期时间字符串
 * @returns Unix时间戳
 */
export function parseDateTime(dateStr: string): number {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error('无效的日期时间格式')
  }
  return Math.floor(date.getTime() / 1000)
}

/**
 * 获取相对时间描述
 * @param date 日期对象
 * @returns 相对时间字符串
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffSeconds < 60) {
    return diffSeconds <= 0 ? '刚刚' : `${diffSeconds}秒前`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 30) {
    return `${diffDays}天前`
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`
  } else {
    return `${diffYears}年前`
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化证书信息
 * @param certInfo 证书信息对象
 * @returns 格式化后的证书信息
 */
export function formatCertificateInfo(certInfo: any): {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  serialNumber: string
  fingerprint: string
  isExpired: boolean
  daysUntilExpiry: number
  status: 'valid' | 'expired' | 'warning'
} {
  const now = new Date()
  const validTo = new Date(certInfo.validity.notAfter)
  const validFrom = new Date(certInfo.validity.notBefore)
  
  const isExpired = validTo < now
  const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  let status: 'valid' | 'expired' | 'warning' = 'valid'
  if (isExpired) {
    status = 'expired'
  } else if (daysUntilExpiry <= 30) {
    status = 'warning'
  }
  
  return {
    subject: formatDistinguishedName(certInfo.subject),
    issuer: formatDistinguishedName(certInfo.issuer),
    validFrom: validFrom.toLocaleString('zh-CN'),
    validTo: validTo.toLocaleString('zh-CN'),
    serialNumber: certInfo.serialNumber,
    fingerprint: certInfo.fingerprint || 'N/A',
    isExpired,
    daysUntilExpiry,
    status
  }
}

/**
 * 格式化证书主题/颁发者名称
 * @param dn 证书名称对象
 * @returns 格式化后的名称字符串
 */
export function formatDistinguishedName(dn: any): string {
  const parts: string[] = []
  
  if (dn.commonName) parts.push(`CN=${dn.commonName}`)
  if (dn.organizationName) parts.push(`O=${dn.organizationName}`)
  if (dn.organizationalUnitName) parts.push(`OU=${dn.organizationalUnitName}`)
  if (dn.localityName) parts.push(`L=${dn.localityName}`)
  if (dn.stateOrProvinceName) parts.push(`ST=${dn.stateOrProvinceName}`)
  if (dn.countryName) parts.push(`C=${dn.countryName}`)
  
  return parts.join(', ') || 'N/A'
}

/**
 * 格式化密码强度
 * @param password 密码字符串
 * @returns 密码强度信息
 */
export function formatPasswordStrength(password: string): {
  score: number
  level: 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []
  
  // 长度检查
  if (password.length >= 8) score += 1
  else feedback.push('密码长度至少8位')
  
  if (password.length >= 12) score += 1
  
  // 字符类型检查
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('包含小写字母')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('包含大写字母')
  
  if (/[0-9]/.test(password)) score += 1
  else feedback.push('包含数字')
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('包含特殊字符')
  
  // 重复字符检查
  if (!/(..).*\1/.test(password)) score += 1
  else feedback.push('避免重复字符')
  
  let level: 'weak' | 'fair' | 'good' | 'strong'
  if (score <= 2) level = 'weak'
  else if (score <= 4) level = 'fair'
  else if (score <= 6) level = 'good'
  else level = 'strong'
  
  return { score, level, feedback }
}

/**
 * 格式化哈希值显示
 * @param hash 哈希值字符串
 * @param groupSize 分组大小
 * @returns 格式化后的哈希值
 */
export function formatHash(hash: string, groupSize: number = 8): string {
  if (!hash) return ''
  
  const groups: string[] = []
  for (let i = 0; i < hash.length; i += groupSize) {
    groups.push(hash.slice(i, i + groupSize))
  }
  
  return groups.join(' ')
}

/**
 * 格式化Base64字符串显示
 * @param base64 Base64字符串
 * @param lineLength 每行长度
 * @returns 格式化后的Base64字符串
 */
export function formatBase64(base64: string, lineLength: number = 64): string {
  if (!base64) return ''
  
  const lines: string[] = []
  for (let i = 0; i < base64.length; i += lineLength) {
    lines.push(base64.slice(i, i + lineLength))
  }
  
  return lines.join('\n')
}

/**
 * 格式化数字显示（添加千分位分隔符）
 * @param num 数字
 * @param locale 地区设置
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number, locale: string = 'zh-CN'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * 格式化百分比
 * @param value 数值
 * @param total 总数
 * @param decimals 小数位数
 * @returns 百分比字符串
 */
export function formatPercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * 格式化持续时间
 * @param milliseconds 毫秒数
 * @returns 格式化后的持续时间字符串
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟 ${seconds % 60}秒`
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

/**
 * 截断文本并添加省略号
 * @param text 文本
 * @param maxLength 最大长度
 * @param suffix 后缀
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 格式化错误消息
 * @param error 错误对象或字符串
 * @returns 格式化后的错误消息
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '未知错误'
}