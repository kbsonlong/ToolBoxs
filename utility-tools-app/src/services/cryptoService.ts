/**
 * 加密服务
 * 提供各种加密、解密和编码功能
 */

import CryptoJS from 'crypto-js'
import { isValidBase64 } from '@/utils/validators'
import { formatError } from '@/utils/formatters'

// 重新导出验证函数
export { isValidBase64 }

/**
 * Base64编码
 * @param text 待编码的文本
 * @returns Base64编码结果
 */
export function encodeBase64(text: string): string {
  try {
    if (!text) return ''
    return btoa(unescape(encodeURIComponent(text)))
  } catch (error) {
    throw new Error(`Base64编码失败: ${formatError(error)}`)
  }
}

/**
 * Base64解码
 * @param base64 Base64编码的字符串
 * @returns 解码后的文本
 */
export function decodeBase64(base64: string): string {
  try {
    if (!base64) return ''
    
    if (!isValidBase64(base64)) {
      throw new Error('无效的Base64格式')
    }
    
    return decodeURIComponent(escape(atob(base64)))
  } catch (error) {
    throw new Error(`Base64解码失败: ${formatError(error)}`)
  }
}

/**
 * MD5加密
 * @param text 待加密的文本
 * @returns MD5哈希值
 */
export function generateMD5(text: string): string {
  try {
    return CryptoJS.MD5(text).toString()
  } catch (error) {
    throw new Error(`MD5计算失败: ${formatError(error)}`)
  }
}

/**
 * 计算MD5哈希值（别名函数）
 * @param text 待计算的文本
 * @returns MD5哈希值
 */
export function calculateMD5Hash(text: string): string {
  return generateMD5(text)
}

/**
 * SHA1加密
 * @param text 待加密的文本
 * @returns SHA1哈希值
 */
export function generateSHA1(text: string): string {
  try {
    return CryptoJS.SHA1(text).toString()
  } catch (error) {
    throw new Error(`SHA1加密失败: ${formatError(error)}`)
  }
}

/**
 * SHA256加密
 * @param text 待加密的文本
 * @returns SHA256哈希值
 */
export function generateSHA256(text: string): string {
  try {
    return CryptoJS.SHA256(text).toString()
  } catch (error) {
    throw new Error(`SHA256加密失败: ${formatError(error)}`)
  }
}

/**
 * 生成安全随机密码
 * @param config 密码配置
 * @returns 生成的密码数组
 */
export function generatePasswords(config: {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  quantity: number
}): string[] {
  const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, quantity } = config
  
  // 构建字符集
  let charset = ''
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (includeNumbers) charset += '0123456789'
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  if (!charset) {
    throw new Error('至少需要选择一种字符类型')
  }
  
  const passwords: string[] = []
  
  for (let i = 0; i < quantity; i++) {
    let password = ''
    
    // 确保包含每种选中的字符类型
    const requiredChars: string[] = []
    if (includeUppercase) requiredChars.push(getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'))
    if (includeLowercase) requiredChars.push(getRandomChar('abcdefghijklmnopqrstuvwxyz'))
    if (includeNumbers) requiredChars.push(getRandomChar('0123456789'))
    if (includeSymbols) requiredChars.push(getRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?'))
    
    // 添加必需字符
    for (const char of requiredChars) {
      password += char
    }
    
    // 填充剩余长度
    for (let j = password.length; j < length; j++) {
      password += getRandomChar(charset)
    }
    
    // 打乱字符顺序
    password = shuffleString(password)
    
    passwords.push(password)
  }
  
  return passwords
}

/**
 * 从字符集中获取随机字符
 * @param charset 字符集
 * @returns 随机字符
 */
function getRandomChar(charset: string): string {
  const randomIndex = Math.floor(Math.random() * charset.length)
  return charset[randomIndex]
}

/**
 * 打乱字符串字符顺序
 * @param str 字符串
 * @returns 打乱后的字符串
 */
function shuffleString(str: string): string {
  const array = str.split('')
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array.join('')
}

/**
 * URL编码
 * @param text 待编码的文本
 * @returns URL编码结果
 */
export function encodeURL(text: string): string {
  try {
    return encodeURIComponent(text)
  } catch (error) {
    throw new Error(`URL编码失败: ${formatError(error)}`)
  }
}

/**
 * URL解码
 * @param encodedText URL编码的文本
 * @returns 解码后的文本
 */
export function decodeURL(encodedText: string): string {
  try {
    return decodeURIComponent(encodedText)
  } catch (error) {
    throw new Error(`URL解码失败: ${formatError(error)}`)
  }
}

/**
 * HTML实体编码
 * @param text 待编码的文本
 * @returns HTML实体编码结果
 */
export function encodeHTML(text: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  }
  
  return text.replace(/[&<>"'\/]/g, (char) => entityMap[char])
}

/**
 * HTML实体解码
 * @param encodedText HTML实体编码的文本
 * @returns 解码后的文本
 */
export function decodeHTML(encodedText: string): string {
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/'
  }
  
  return encodedText.replace(/&(amp|lt|gt|quot|#39|#x2F);/g, (entity) => entityMap[entity])
}

/**
 * 生成UUID
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 计算文本的各种哈希值
 * @param text 待计算的文本
 * @returns 包含多种哈希值的对象
 */
export function calculateHashes(text: string): {
  md5: string
  sha1: string
  sha256: string
  sha512: string
} {
  try {
    return {
      md5: CryptoJS.MD5(text).toString(),
      sha1: CryptoJS.SHA1(text).toString(),
      sha256: CryptoJS.SHA256(text).toString(),
      sha512: CryptoJS.SHA512(text).toString()
    }
  } catch (error) {
    throw new Error(`哈希计算失败: ${formatError(error)}`)
  }
}

/**
 * 验证哈希值
 * @param text 原始文本
 * @param hash 哈希值
 * @param algorithm 哈希算法
 * @returns 是否匹配
 */
export function verifyHash(
  text: string,
  hash: string,
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512'
): boolean {
  try {
    let calculatedHash: string
    
    switch (algorithm.toLowerCase()) {
      case 'md5':
        calculatedHash = CryptoJS.MD5(text).toString()
        break
      case 'sha1':
        calculatedHash = CryptoJS.SHA1(text).toString()
        break
      case 'sha256':
        calculatedHash = CryptoJS.SHA256(text).toString()
        break
      case 'sha512':
        calculatedHash = CryptoJS.SHA512(text).toString()
        break
      default:
        throw new Error('不支持的哈希算法')
    }
    
    return calculatedHash.toLowerCase() === hash.toLowerCase()
  } catch (error) {
    throw new Error(`哈希验证失败: ${formatError(error)}`)
  }
}

/**
 * 生成随机字符串
 * @param length 长度
 * @param charset 字符集
 * @returns 随机字符串
 */
export function generateRandomString(
  length: number,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}