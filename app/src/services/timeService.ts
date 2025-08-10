/**
 * 时间服务
 * 提供时间格式转换和处理功能
 */

import { formatTimestamp, parseDateTime, getRelativeTime, formatError } from '@/utils/formatters'
import { isValidTimestamp, isValidDateTime } from '@/utils/validators'

// 重新导出formatters中的函数
export { formatTimestamp, parseDateTime, getRelativeTime }

// 时间格式常量
export const TIME_FORMATS = {
  'YYYY-MM-DD': 'YYYY-MM-DD',
  'YYYY/MM/DD': 'YYYY/MM/DD',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'YYYY-MM-DD HH:mm:ss': 'YYYY-MM-DD HH:mm:ss',
  'MM/DD/YYYY HH:mm:ss': 'MM/DD/YYYY HH:mm:ss',
  'YYYY年MM月DD日': 'YYYY年MM月DD日',
  'MM月DD日 HH:mm': 'MM月DD日 HH:mm',
  'HH:mm:ss': 'HH:mm:ss',
  'ISO': 'ISO'
}

/**
 * 时区列表
 */
export const TIMEZONES = [
  { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
  { value: 'UTC', label: '协调世界时 (UTC+0)' },
  { value: 'America/New_York', label: '纽约时间 (UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: '洛杉矶时间 (UTC-8/-7)' },
  { value: 'Europe/London', label: '伦敦时间 (UTC+0/+1)' },
  { value: 'Europe/Paris', label: '巴黎时间 (UTC+1/+2)' },
  { value: 'Asia/Tokyo', label: '东京时间 (UTC+9)' },
  { value: 'Asia/Seoul', label: '首尔时间 (UTC+9)' },
  { value: 'Asia/Dubai', label: '迪拜时间 (UTC+4)' },
  { value: 'Australia/Sydney', label: '悉尼时间 (UTC+10/+11)' }
]

/**
 * 时间格式转换结果接口
 */
export interface TimeConversionResult {
  timestamp: number
  iso: string
  local: string
  utc: string
  relative: string
  timezone: string
  weekday: string
  isValid: boolean
  error?: string
}

/**
 * 将Unix时间戳转换为各种格式
 * @param timestamp Unix时间戳
 * @param timezone 目标时区
 * @returns 转换结果
 */
export function convertTimestamp(
  timestamp: string | number,
  timezone: string = 'Asia/Shanghai'
): TimeConversionResult {
  try {
    const numTimestamp = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
    
    if (!isValidTimestamp(numTimestamp)) {
      return {
        timestamp: 0,
        iso: '',
        local: '',
        utc: '',
        relative: '',
        timezone,
        weekday: '',
        isValid: false,
        error: '无效的时间戳格式'
      }
    }
    
    const formatted = formatTimestamp(numTimestamp, timezone)
    const date = new Date(numTimestamp * 1000)
    
    // 获取星期几
    const weekday = date.toLocaleDateString('zh-CN', {
      weekday: 'long',
      timeZone: timezone
    })
    
    return {
      timestamp: numTimestamp,
      iso: formatted.iso,
      local: formatted.local,
      utc: formatted.utc,
      relative: formatted.relative,
      timezone,
      weekday,
      isValid: true
    }
  } catch (error) {
    return {
      timestamp: 0,
      iso: '',
      local: '',
      utc: '',
      relative: '',
      timezone,
      weekday: '',
      isValid: false,
      error: formatError(error)
    }
  }
}

/**
 * 将日期时间字符串转换为时间戳和其他格式
 * @param dateTimeStr 日期时间字符串
 * @param timezone 时区
 * @returns 转换结果
 */
export function convertDateTime(
  dateTimeStr: string,
  timezone: string = 'Asia/Shanghai'
): TimeConversionResult {
  try {
    if (!isValidDateTime(dateTimeStr)) {
      return {
        timestamp: 0,
        iso: '',
        local: '',
        utc: '',
        relative: '',
        timezone,
        weekday: '',
        isValid: false,
        error: '无效的日期时间格式'
      }
    }
    
    const timestamp = parseDateTime(dateTimeStr)
    return convertTimestamp(timestamp, timezone)
  } catch (error) {
    return {
      timestamp: 0,
      iso: '',
      local: '',
      utc: '',
      relative: '',
      timezone,
      weekday: '',
      isValid: false,
      error: formatError(error)
    }
  }
}

/**
 * 获取当前时间戳
 * @returns 当前Unix时间戳
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * 获取当前时间的各种格式
 * @param timezone 时区
 * @returns 当前时间的转换结果
 */
export function getCurrentTime(timezone: string = 'Asia/Shanghai'): TimeConversionResult {
  const currentTimestamp = getCurrentTimestamp()
  return convertTimestamp(currentTimestamp, timezone)
}

/**
 * 时间差计算
 * @param startTime 开始时间戳
 * @param endTime 结束时间戳
 * @returns 时间差信息
 */
export function calculateTimeDifference(
  startTime: number,
  endTime: number
): {
  seconds: number
  minutes: number
  hours: number
  days: number
  weeks: number
  months: number
  years: number
  humanReadable: string
} {
  const diffSeconds = Math.abs(endTime - startTime)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  let humanReadable = ''
  if (diffYears > 0) {
    humanReadable = `${diffYears}年`
    if (diffMonths % 12 > 0) humanReadable += `${diffMonths % 12}个月`
  } else if (diffMonths > 0) {
    humanReadable = `${diffMonths}个月`
    if (diffDays % 30 > 0) humanReadable += `${diffDays % 30}天`
  } else if (diffWeeks > 0) {
    humanReadable = `${diffWeeks}周`
    if (diffDays % 7 > 0) humanReadable += `${diffDays % 7}天`
  } else if (diffDays > 0) {
    humanReadable = `${diffDays}天`
    if (diffHours % 24 > 0) humanReadable += `${diffHours % 24}小时`
  } else if (diffHours > 0) {
    humanReadable = `${diffHours}小时`
    if (diffMinutes % 60 > 0) humanReadable += `${diffMinutes % 60}分钟`
  } else if (diffMinutes > 0) {
    humanReadable = `${diffMinutes}分钟`
    if (diffSeconds % 60 > 0) humanReadable += `${diffSeconds % 60}秒`
  } else {
    humanReadable = `${diffSeconds}秒`
  }
  
  return {
    seconds: diffSeconds,
    minutes: diffMinutes,
    hours: diffHours,
    days: diffDays,
    weeks: diffWeeks,
    months: diffMonths,
    years: diffYears,
    humanReadable
  }
}

/**
 * 格式化时间为指定格式
 * @param timestamp 时间戳
 * @param format 格式字符串
 * @param timezone 时区
 * @returns 格式化后的时间字符串
 */
export function formatTimeWithPattern(
  timestamp: number,
  format: string,
  timezone: string = 'Asia/Shanghai'
): string {
  const date = new Date(timestamp * 1000)
  
  const formatMap: Record<string, string> = {
    'YYYY': date.toLocaleDateString('zh-CN', { year: 'numeric', timeZone: timezone }),
    'MM': date.toLocaleDateString('zh-CN', { month: '2-digit', timeZone: timezone }),
    'DD': date.toLocaleDateString('zh-CN', { day: '2-digit', timeZone: timezone }),
    'HH': date.toLocaleTimeString('zh-CN', { hour: '2-digit', hour12: false, timeZone: timezone }),
    'mm': date.toLocaleTimeString('zh-CN', { minute: '2-digit', timeZone: timezone }),
    'ss': date.toLocaleTimeString('zh-CN', { second: '2-digit', timeZone: timezone })
  }
  
  let result = format
  for (const [pattern, value] of Object.entries(formatMap)) {
    result = result.replace(new RegExp(pattern, 'g'), value)
  }
  
  return result
}

/**
 * 获取时区偏移量
 * @param timezone 时区
 * @returns 偏移量（分钟）
 */
export function getTimezoneOffset(timezone: string): number {
  const date = new Date()
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  const targetTime = new Date(utc + (getTimezoneOffsetMinutes(timezone) * 60000))
  return (targetTime.getTime() - date.getTime()) / 60000
}

/**
 * 获取时区偏移分钟数
 * @param timezone 时区
 * @returns 偏移分钟数
 */
function getTimezoneOffsetMinutes(timezone: string): number {
  const now = new Date()
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
  return (target.getTime() - utc.getTime()) / 60000
}

/**
 * 判断是否为闰年
 * @param year 年份
 * @returns 是否为闰年
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

/**
 * 获取月份天数
 * @param year 年份
 * @param month 月份 (1-12)
 * @returns 天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 获取一年中的第几天
 * @param timestamp 时间戳
 * @returns 一年中的第几天
 */
export function getDayOfYear(timestamp: number): number {
  const date = new Date(timestamp * 1000)
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * 获取一年中的第几周
 * @param timestamp 时间戳
 * @returns 一年中的第几周
 */
export function getWeekOfYear(timestamp: number): number {
  const date = new Date(timestamp * 1000)
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + firstDay.getDay() + 1) / 7)
}

/**
 * 时间加减运算
 * @param timestamp 基础时间戳
 * @param amount 数量
 * @param unit 单位
 * @returns 计算后的时间戳
 */
export function addTime(
  timestamp: number,
  amount: number,
  unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
): number {
  const date = new Date(timestamp * 1000)
  
  switch (unit) {
    case 'seconds':
      date.setSeconds(date.getSeconds() + amount)
      break
    case 'minutes':
      date.setMinutes(date.getMinutes() + amount)
      break
    case 'hours':
      date.setHours(date.getHours() + amount)
      break
    case 'days':
      date.setDate(date.getDate() + amount)
      break
    case 'weeks':
      date.setDate(date.getDate() + (amount * 7))
      break
    case 'months':
      date.setMonth(date.getMonth() + amount)
      break
    case 'years':
      date.setFullYear(date.getFullYear() + amount)
      break
  }
  
  return Math.floor(date.getTime() / 1000)
}

/**
 * 获取常用时间格式示例
 * @returns 时间格式示例数组
 */
export function getTimeFormatExamples(): Array<{
  format: string
  description: string
  example: string
}> {
  const now = getCurrentTimestamp()
  
  return [
    {
      format: 'YYYY-MM-DD HH:mm:ss',
      description: '标准日期时间格式',
      example: formatTimeWithPattern(now, 'YYYY-MM-DD HH:mm:ss')
    },
    {
      format: 'YYYY/MM/DD',
      description: '日期格式',
      example: formatTimeWithPattern(now, 'YYYY/MM/DD')
    },
    {
      format: 'HH:mm:ss',
      description: '时间格式',
      example: formatTimeWithPattern(now, 'HH:mm:ss')
    },
    {
      format: 'YYYY年MM月DD日',
      description: '中文日期格式',
      example: formatTimeWithPattern(now, 'YYYY年MM月DD日')
    }
  ]
}