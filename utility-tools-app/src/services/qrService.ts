/**
 * QR码服务
 * 提供QR码生成和处理功能
 */

import QRCode from 'qrcode'
import { validateQRCodeInput, isValidURL } from '@/utils/validators'
import { formatError } from '@/utils/formatters'

/**
 * QR码错误纠正级别
 */
export const ERROR_CORRECTION_LEVELS = [
  { value: 'L', label: 'L - 低 (~7%)', description: '可恢复约7%的数据' },
  { value: 'M', label: 'M - 中 (~15%)', description: '可恢复约15%的数据' },
  { value: 'Q', label: 'Q - 四分位 (~25%)', description: '可恢复约25%的数据' },
  { value: 'H', label: 'H - 高 (~30%)', description: '可恢复约30%的数据' }
] as const

/**
 * QR码类型
 */
export const QR_CODE_TYPES = [
  { value: 'text', label: '纯文本', icon: 'Document' },
  { value: 'url', label: '网址链接', icon: 'Link' },
  { value: 'email', label: '电子邮件', icon: 'Message' },
  { value: 'phone', label: '电话号码', icon: 'Phone' },
  { value: 'sms', label: '短信', icon: 'ChatDotRound' },
  { value: 'wifi', label: 'WiFi配置', icon: 'Wifi' },
  { value: 'vcard', label: '联系人名片', icon: 'User' },
  { value: 'location', label: '地理位置', icon: 'Location' }
] as const

/**
 * QR码生成选项
 */
export interface QRCodeOptions {
  text: string
  size: number
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  margin: number
  color: {
    dark: string
    light: string
  }
  type: string
}

/**
 * QR码生成结果
 */
export interface QRCodeResult {
  success: boolean
  dataUrl?: string
  svg?: string
  size: number
  text: string
  errorCorrectionLevel: string
  estimatedCapacity: number
  actualLength: number
  error?: string
}

/**
 * WiFi配置接口
 */
export interface WiFiConfig {
  ssid: string
  password: string
  security: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

/**
 * 联系人名片接口
 */
export interface VCardConfig {
  firstName: string
  lastName: string
  organization: string
  phone: string
  email: string
  url: string
  address: string
}

/**
 * 短信配置接口
 */
export interface SMSConfig {
  phone: string
  message: string
}

/**
 * 地理位置配置接口
 */
export interface LocationConfig {
  latitude: number
  longitude: number
  altitude?: number
}

/**
 * 生成QR码
 * @param options QR码选项
 * @returns QR码生成结果
 */
export async function generateQRCode(options: QRCodeOptions): Promise<QRCodeResult> {
  try {
    // 验证输入
    const validation = validateQRCodeInput(options.text, options.size)
    if (!validation.isValid) {
      return {
        success: false,
        size: options.size,
        text: options.text,
        errorCorrectionLevel: options.errorCorrectionLevel,
        estimatedCapacity: 0,
        actualLength: options.text.length,
        error: validation.error
      }
    }

    // QR码生成配置
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel,
      type: 'image/png' as const,
      quality: 0.92,
      margin: options.margin,
      color: {
        dark: options.color.dark,
        light: options.color.light
      },
      width: options.size
    }

    // 生成QR码数据URL
    const dataUrl = await QRCode.toDataURL(options.text, qrOptions)
    
    // 生成SVG格式
    const svg = await QRCode.toString(options.text, {
      ...qrOptions,
      type: 'svg'
    })

    // 计算容量信息
    const estimatedCapacity = getQRCodeCapacity(options.errorCorrectionLevel)
    
    return {
      success: true,
      dataUrl,
      svg,
      size: options.size,
      text: options.text,
      errorCorrectionLevel: options.errorCorrectionLevel,
      estimatedCapacity,
      actualLength: options.text.length
    }
  } catch (error) {
    return {
      success: false,
      size: options.size,
      text: options.text,
      errorCorrectionLevel: options.errorCorrectionLevel,
      estimatedCapacity: 0,
      actualLength: options.text.length,
      error: formatError(error)
    }
  }
}

/**
 * 根据类型格式化QR码文本
 * @param type QR码类型
 * @param data 数据
 * @returns 格式化后的文本
 */
export function formatQRCodeText(type: string, data: any): string {
  switch (type) {
    case 'url':
      return data.url || data
    
    case 'email':
      return `mailto:${data.email || data}${data.subject ? `?subject=${encodeURIComponent(data.subject)}` : ''}${data.body ? `&body=${encodeURIComponent(data.body)}` : ''}`
    
    case 'phone':
      return `tel:${data.phone || data}`
    
    case 'sms':
      const smsData = data as SMSConfig
      return `sms:${smsData.phone}${smsData.message ? `?body=${encodeURIComponent(smsData.message)}` : ''}`
    
    case 'wifi':
      const wifiData = data as WiFiConfig
      return `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden ? 'true' : 'false'};;`
    
    case 'vcard':
      const vcard = data as VCardConfig
      return `BEGIN:VCARD
VERSION:3.0
FN:${vcard.firstName} ${vcard.lastName}
ORG:${vcard.organization}
TEL:${vcard.phone}
EMAIL:${vcard.email}
URL:${vcard.url}
ADR:${vcard.address}
END:VCARD`
    
    case 'location':
      const location = data as LocationConfig
      return `geo:${location.latitude},${location.longitude}${location.altitude ? `,${location.altitude}` : ''}`
    
    case 'text':
    default:
      return data.text || data
  }
}

/**
 * 获取QR码容量估算
 * @param errorCorrectionLevel 错误纠正级别
 * @returns 估算容量（字符数）
 */
export function getQRCodeCapacity(errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'): number {
  // QR码版本40的理论最大容量（数字字符）
  const maxCapacities = {
    L: 7089,  // 低级别
    M: 5596,  // 中级别
    Q: 3993,  // 四分位级别
    H: 3057   // 高级别
  }
  
  // 对于混合字符，容量约为数字容量的1/3
  return Math.floor(maxCapacities[errorCorrectionLevel] / 3)
}

/**
 * 验证QR码文本长度
 * @param text 文本内容
 * @param errorCorrectionLevel 错误纠正级别
 * @returns 验证结果
 */
export function validateQRCodeLength(
  text: string,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
): { isValid: boolean; capacity: number; length: number; error?: string } {
  const capacity = getQRCodeCapacity(errorCorrectionLevel)
  const length = text.length
  
  if (length > capacity) {
    return {
      isValid: false,
      capacity,
      length,
      error: `文本长度超出限制。当前长度：${length}，最大容量：${capacity}`
    }
  }
  
  return {
    isValid: true,
    capacity,
    length
  }
}

/**
 * 获取QR码预设模板
 * @returns 预设模板数组
 */
export function getQRCodeTemplates(): Array<{
  type: string
  name: string
  description: string
  example: string
  fields: Array<{
    key: string
    label: string
    type: string
    required: boolean
    placeholder?: string
  }>
}> {
  return [
    {
      type: 'url',
      name: '网址链接',
      description: '生成网站链接的QR码',
      example: 'https://www.example.com',
      fields: [
        {
          key: 'url',
          label: '网址',
          type: 'url',
          required: true,
          placeholder: 'https://www.example.com'
        }
      ]
    },
    {
      type: 'email',
      name: '电子邮件',
      description: '生成邮件地址的QR码',
      example: 'mailto:example@email.com',
      fields: [
        {
          key: 'email',
          label: '邮箱地址',
          type: 'email',
          required: true,
          placeholder: 'example@email.com'
        },
        {
          key: 'subject',
          label: '邮件主题',
          type: 'text',
          required: false,
          placeholder: '邮件主题（可选）'
        },
        {
          key: 'body',
          label: '邮件内容',
          type: 'textarea',
          required: false,
          placeholder: '邮件内容（可选）'
        }
      ]
    },
    {
      type: 'phone',
      name: '电话号码',
      description: '生成电话号码的QR码',
      example: 'tel:+86138****8888',
      fields: [
        {
          key: 'phone',
          label: '电话号码',
          type: 'tel',
          required: true,
          placeholder: '+86138****8888'
        }
      ]
    },
    {
      type: 'sms',
      name: '短信',
      description: '生成短信的QR码',
      example: 'sms:138****8888?body=Hello',
      fields: [
        {
          key: 'phone',
          label: '手机号码',
          type: 'tel',
          required: true,
          placeholder: '138****8888'
        },
        {
          key: 'message',
          label: '短信内容',
          type: 'textarea',
          required: false,
          placeholder: '短信内容（可选）'
        }
      ]
    },
    {
      type: 'wifi',
      name: 'WiFi配置',
      description: '生成WiFi连接配置的QR码',
      example: 'WIFI:T:WPA;S:MyWiFi;P:password123;H:false;;',
      fields: [
        {
          key: 'ssid',
          label: 'WiFi名称(SSID)',
          type: 'text',
          required: true,
          placeholder: 'MyWiFi'
        },
        {
          key: 'password',
          label: 'WiFi密码',
          type: 'password',
          required: false,
          placeholder: 'WiFi密码'
        },
        {
          key: 'security',
          label: '安全类型',
          type: 'select',
          required: true
        },
        {
          key: 'hidden',
          label: '隐藏网络',
          type: 'checkbox',
          required: false
        }
      ]
    },
    {
      type: 'location',
      name: '地理位置',
      description: '生成地理位置的QR码',
      example: 'geo:39.9042,116.4074',
      fields: [
        {
          key: 'latitude',
          label: '纬度',
          type: 'number',
          required: true,
          placeholder: '39.9042'
        },
        {
          key: 'longitude',
          label: '经度',
          type: 'number',
          required: true,
          placeholder: '116.4074'
        },
        {
          key: 'altitude',
          label: '海拔高度',
          type: 'number',
          required: false,
          placeholder: '海拔高度（可选）'
        }
      ]
    }
  ]
}

/**
 * 下载QR码图片
 * @param dataUrl QR码数据URL
 * @param filename 文件名
 */
export function downloadQRCode(dataUrl: string, filename: string = 'qrcode.png'): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 复制QR码到剪贴板
 * @param dataUrl QR码数据URL
 * @returns 是否成功
 */
export async function copyQRCodeToClipboard(dataUrl: string): Promise<boolean> {
  try {
    // 将dataUrl转换为Blob
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    
    // 复制到剪贴板
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    
    return true
  } catch (error) {
    console.error('复制QR码失败:', error)
    return false
  }
}

/**
 * 获取QR码统计信息
 * @param text QR码文本
 * @param errorCorrectionLevel 错误纠正级别
 * @returns 统计信息
 */
export function getQRCodeStats(
  text: string,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
): {
  textLength: number
  byteLength: number
  capacity: number
  usagePercentage: number
  recommendedLevel: 'L' | 'M' | 'Q' | 'H'
  estimatedVersion: number
} {
  const textLength = text.length
  const byteLength = new TextEncoder().encode(text).length
  const capacity = getQRCodeCapacity(errorCorrectionLevel)
  const usagePercentage = Math.round((textLength / capacity) * 100)
  
  // 推荐错误纠正级别
  let recommendedLevel: 'L' | 'M' | 'Q' | 'H' = 'M'
  if (usagePercentage < 50) {
    recommendedLevel = 'H' // 数据量小，可以使用高纠错
  } else if (usagePercentage < 75) {
    recommendedLevel = 'Q'
  } else if (usagePercentage < 90) {
    recommendedLevel = 'M'
  } else {
    recommendedLevel = 'L' // 数据量大，使用低纠错
  }
  
  // 估算QR码版本（简化计算）
  const estimatedVersion = Math.min(40, Math.max(1, Math.ceil(textLength / 100)))
  
  return {
    textLength,
    byteLength,
    capacity,
    usagePercentage,
    recommendedLevel,
    estimatedVersion
  }
}

/**
 * 批量生成QR码
 * @param items 批量数据
 * @param options 基础选项
 * @returns 批量生成结果
 */
export async function generateBatchQRCodes(
  items: Array<{ text: string; filename?: string }>,
  options: Omit<QRCodeOptions, 'text'>
): Promise<Array<QRCodeResult & { filename?: string }>> {
  const results: Array<QRCodeResult & { filename?: string }> = []
  
  for (const item of items) {
    const result = await generateQRCode({
      ...options,
      text: item.text
    })
    
    results.push({
      ...result,
      filename: item.filename
    })
  }
  
  return results
}

/**
 * 验证QR码URL
 * @param text QR码文本
 * @returns 验证结果
 */
export function validateQRCodeURL(text: string): {
  isValid: boolean
  type: 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'location' | 'text'
  error?: string
} {
  // URL检测
  if (isValidURL(text)) {
    return { isValid: true, type: 'url' }
  }
  
  // 邮件检测
  if (text.startsWith('mailto:')) {
    return { isValid: true, type: 'email' }
  }
  
  // 电话检测
  if (text.startsWith('tel:')) {
    return { isValid: true, type: 'phone' }
  }
  
  // 短信检测
  if (text.startsWith('sms:')) {
    return { isValid: true, type: 'sms' }
  }
  
  // WiFi检测
  if (text.startsWith('WIFI:')) {
    return { isValid: true, type: 'wifi' }
  }
  
  // vCard检测
  if (text.startsWith('BEGIN:VCARD')) {
    return { isValid: true, type: 'vcard' }
  }
  
  // 地理位置检测
  if (text.startsWith('geo:')) {
    return { isValid: true, type: 'location' }
  }
  
  // 默认为文本
  return { isValid: true, type: 'text' }
}