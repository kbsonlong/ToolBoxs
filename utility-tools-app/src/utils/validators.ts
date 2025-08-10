/**
 * 验证器工具函数
 * 提供各种输入验证功能
 */

/**
 * 验证Base64字符串格式
 * @param str 待验证的字符串
 * @returns 是否为有效的Base64格式
 */
export function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false
  }
  
  // Base64正则表达式
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  
  // 检查字符串长度是否为4的倍数
  if (str.length % 4 !== 0) {
    return false
  }
  
  return base64Regex.test(str)
}

/**
 * 验证JSON字符串格式
 * @param str 待验证的JSON字符串
 * @returns 验证结果对象
 */
export function validateJSON(str: string): {
  isValid: boolean
  error?: string
  line?: number
  column?: number
} {
  if (!str || typeof str !== 'string') {
    return {
      isValid: false,
      error: '输入不能为空'
    }
  }
  
  try {
    JSON.parse(str)
    return { isValid: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    
    // 尝试提取行号和列号
    const match = errorMessage.match(/at position (\d+)/)
    if (match) {
      const position = parseInt(match[1])
      const lines = str.substring(0, position).split('\n')
      const line = lines.length
      const column = lines[lines.length - 1].length + 1
      
      return {
        isValid: false,
        error: errorMessage,
        line,
        column
      }
    }
    
    return {
      isValid: false,
      error: errorMessage
    }
  }
}

/**
 * 验证Unix时间戳
 * @param timestamp 时间戳字符串或数字
 * @returns 是否为有效的时间戳
 */
export function isValidTimestamp(timestamp: string | number): boolean {
  const num = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  
  if (isNaN(num)) {
    return false
  }
  
  // 检查时间戳范围 (1970-2100年)
  const minTimestamp = 0
  const maxTimestamp = 4102444800 // 2100年1月1日
  
  return num >= minTimestamp && num <= maxTimestamp
}

/**
 * 验证日期时间字符串
 * @param dateStr 日期时间字符串
 * @returns 是否为有效的日期时间
 */
export function isValidDateTime(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') {
    return false
  }
  
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

/**
 * 验证密码配置
 * @param config 密码生成配置
 * @returns 验证结果
 */
export function validatePasswordConfig(config: {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  quantity: number
}): {
  isValid: boolean
  error?: string
} {
  const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, quantity } = config
  
  // 验证长度
  if (!Number.isInteger(length) || length < 4 || length > 128) {
    return {
      isValid: false,
      error: '密码长度必须在4-128位之间'
    }
  }
  
  // 验证数量
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return {
      isValid: false,
      error: '生成数量必须在1-100之间'
    }
  }
  
  // 验证至少选择一种字符类型
  if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
    return {
      isValid: false,
      error: '至少需要选择一种字符类型'
    }
  }
  
  return { isValid: true }
}

/**
 * 验证二维码输入
 * @param text 输入文本
 * @param size 二维码尺寸
 * @returns 验证结果
 */
export function validateQRCodeInput(text: string, size: number): {
  isValid: boolean
  error?: string
} {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      error: '输入内容不能为空'
    }
  }
  
  // 检查文本长度 (二维码容量限制)
  if (text.length > 2953) {
    return {
      isValid: false,
      error: '输入内容过长，超出二维码容量限制'
    }
  }
  
  // 验证尺寸
  if (!Number.isInteger(size) || size < 100 || size > 1000) {
    return {
      isValid: false,
      error: '二维码尺寸必须在100-1000像素之间'
    }
  }
  
  return { isValid: true }
}

/**
 * 验证TLS证书格式
 * @param certData 证书数据
 * @returns 是否为有效的证书格式
 */
export function isValidCertificate(certData: string): boolean {
  if (!certData || typeof certData !== 'string') {
    return false
  }
  
  // 检查PEM格式
  const pemRegex = /-----BEGIN CERTIFICATE-----[\s\S]*-----END CERTIFICATE-----/
  
  return pemRegex.test(certData.trim())
}

/**
 * 验证URL格式
 * @param url URL字符串
 * @returns 是否为有效的URL
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }
  
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证邮箱格式
 * @param email 邮箱字符串
 * @returns 是否为有效的邮箱
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证IP地址格式
 * @param ip IP地址字符串
 * @returns 是否为有效的IP地址
 */
export function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false
  }
  
  // IPv4正则
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  
  // IPv6正则 (简化版)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * 通用字符串长度验证
 * @param str 字符串
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @returns 验证结果
 */
export function validateStringLength(
  str: string,
  minLength: number = 0,
  maxLength: number = Infinity
): {
  isValid: boolean
  error?: string
} {
  if (typeof str !== 'string') {
    return {
      isValid: false,
      error: '输入必须是字符串'
    }
  }
  
  if (str.length < minLength) {
    return {
      isValid: false,
      error: `输入长度不能少于${minLength}个字符`
    }
  }
  
  if (str.length > maxLength) {
    return {
      isValid: false,
      error: `输入长度不能超过${maxLength}个字符`
    }
  }
  
  return { isValid: true }
}

/**
 * 验证数字范围
 * @param num 数字
 * @param min 最小值
 * @param max 最大值
 * @returns 验证结果
 */
export function validateNumberRange(
  num: number,
  min: number = -Infinity,
  max: number = Infinity
): {
  isValid: boolean
  error?: string
} {
  if (typeof num !== 'number' || isNaN(num)) {
    return {
      isValid: false,
      error: '输入必须是有效数字'
    }
  }
  
  if (num < min) {
    return {
      isValid: false,
      error: `数值不能小于${min}`
    }
  }
  
  if (num > max) {
    return {
      isValid: false,
      error: `数值不能大于${max}`
    }
  }
  
  return { isValid: true }
}