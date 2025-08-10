/**
 * 错误处理服务
 * 提供全局错误处理和日志记录功能
 */

import { formatError } from '@/utils/formatters'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  PARSING = 'parsing',
  CRYPTO = 'crypto',
  FILE = 'file',
  PERMISSION = 'permission',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 应用错误接口
 */
export interface AppError {
  id: string
  type: ErrorType
  severity: ErrorSeverity
  message: string
  details?: string
  timestamp: Date
  context?: Record<string, any>
  stack?: string
  userAgent?: string
  url?: string
}

/**
 * 错误处理器接口
 */
export interface ErrorHandler {
  canHandle(error: Error | AppError): boolean
  handle(error: Error | AppError): Promise<void> | void
}

/**
 * 错误统计接口
 */
export interface ErrorStats {
  total: number
  byType: Record<ErrorType, number>
  bySeverity: Record<ErrorSeverity, number>
  recent: AppError[]
  trends: {
    hourly: number[]
    daily: number[]
  }
}

/**
 * 错误服务类
 */
class ErrorService {
  private errors: AppError[] = []
  private handlers: ErrorHandler[] = []
  private maxErrors = 1000
  private isProduction = import.meta.env.PROD

  /**
   * 注册错误处理器
   * @param handler 错误处理器
   */
  registerHandler(handler: ErrorHandler): void {
    this.handlers.push(handler)
  }

  /**
   * 移除错误处理器
   * @param handler 错误处理器
   */
  unregisterHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler)
    if (index > -1) {
      this.handlers.splice(index, 1)
    }
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param context 上下文信息
   */
  async handleError(
    error: Error | AppError,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      const appError = this.normalizeError(error, context)
      
      // 记录错误
      this.recordError(appError)
      
      // 调用注册的处理器
      for (const handler of this.handlers) {
        if (handler.canHandle(appError)) {
          await handler.handle(appError)
        }
      }
      
      // 在开发环境中输出到控制台
      if (!this.isProduction) {
        console.error('Application Error:', appError)
      }
    } catch (handlerError) {
      console.error('Error in error handler:', handlerError)
    }
  }

  /**
   * 标准化错误对象
   * @param error 原始错误
   * @param context 上下文
   * @returns 标准化的应用错误
   */
  private normalizeError(
    error: Error | AppError,
    context?: Record<string, any>
  ): AppError {
    if (this.isAppError(error)) {
      return {
        ...error,
        context: { ...error.context, ...context }
      }
    }

    return {
      id: this.generateErrorId(),
      type: this.inferErrorType(error),
      severity: this.inferErrorSeverity(error),
      message: error.message || '未知错误',
      details: formatError(error),
      timestamp: new Date(),
      context,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  }

  /**
   * 判断是否为应用错误
   * @param error 错误对象
   * @returns 是否为应用错误
   */
  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'type' in error && 'severity' in error
  }

  /**
   * 推断错误类型
   * @param error 错误对象
   * @returns 错误类型
   */
  private inferErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    if (message.includes('network') || message.includes('fetch') || name.includes('network')) {
      return ErrorType.NETWORK
    }
    if (message.includes('parse') || message.includes('json') || name.includes('syntax')) {
      return ErrorType.PARSING
    }
    if (message.includes('crypto') || message.includes('hash') || message.includes('encrypt')) {
      return ErrorType.CRYPTO
    }
    if (message.includes('file') || message.includes('read') || message.includes('write')) {
      return ErrorType.FILE
    }
    if (message.includes('permission') || message.includes('access') || message.includes('denied')) {
      return ErrorType.PERMISSION
    }
    if (message.includes('timeout') || message.includes('abort')) {
      return ErrorType.TIMEOUT
    }
    if (message.includes('valid') || message.includes('invalid') || message.includes('format')) {
      return ErrorType.VALIDATION
    }

    return ErrorType.UNKNOWN
  }

  /**
   * 推断错误严重程度
   * @param error 错误对象
   * @returns 错误严重程度
   */
  private inferErrorSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    if (name.includes('reference') || name.includes('type') || message.includes('critical')) {
      return ErrorSeverity.CRITICAL
    }
    if (message.includes('network') || message.includes('timeout') || message.includes('permission')) {
      return ErrorSeverity.HIGH
    }
    if (message.includes('parse') || message.includes('format') || message.includes('validation')) {
      return ErrorSeverity.MEDIUM
    }

    return ErrorSeverity.LOW
  }

  /**
   * 生成错误ID
   * @returns 错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 记录错误
   * @param error 应用错误
   */
  private recordError(error: AppError): void {
    this.errors.unshift(error)
    
    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }
    
    // 持久化到本地存储（仅保留最近的错误）
    try {
      const recentErrors = this.errors.slice(0, 100)
      localStorage.setItem('app_errors', JSON.stringify(recentErrors))
    } catch (storageError) {
      console.warn('Failed to save errors to localStorage:', storageError)
    }
  }

  /**
   * 获取错误列表
   * @param limit 限制数量
   * @returns 错误列表
   */
  getErrors(limit?: number): AppError[] {
    return limit ? this.errors.slice(0, limit) : [...this.errors]
  }

  /**
   * 获取错误统计
   * @returns 错误统计
   */
  getErrorStats(): ErrorStats {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const byType = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = this.errors.filter(error => error.type === type).length
      return acc
    }, {} as Record<ErrorType, number>)

    const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = this.errors.filter(error => error.severity === severity).length
      return acc
    }, {} as Record<ErrorSeverity, number>)

    const recent = this.errors.filter(error => error.timestamp >= oneHourAgo)
    
    // 生成趋势数据（简化版）
    const hourly = Array.from({ length: 24 }, (_, i) => {
      const hourStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000)
      const hourEnd = new Date(now.getTime() - i * 60 * 60 * 1000)
      return this.errors.filter(error => 
        error.timestamp >= hourStart && error.timestamp < hourEnd
      ).length
    }).reverse()

    const daily = Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000)
      const dayEnd = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      return this.errors.filter(error => 
        error.timestamp >= dayStart && error.timestamp < dayEnd
      ).length
    }).reverse()

    return {
      total: this.errors.length,
      byType,
      bySeverity,
      recent,
      trends: {
        hourly,
        daily
      }
    }
  }

  /**
   * 清除错误记录
   * @param olderThan 清除指定时间之前的错误
   */
  clearErrors(olderThan?: Date): void {
    if (olderThan) {
      this.errors = this.errors.filter(error => error.timestamp >= olderThan)
    } else {
      this.errors = []
    }
    
    try {
      localStorage.setItem('app_errors', JSON.stringify(this.errors.slice(0, 100)))
    } catch (storageError) {
      console.warn('Failed to update localStorage after clearing errors:', storageError)
    }
  }

  /**
   * 从本地存储加载错误
   */
  loadErrorsFromStorage(): void {
    try {
      const stored = localStorage.getItem('app_errors')
      if (stored) {
        const errors = JSON.parse(stored) as AppError[]
        this.errors = errors.map(error => ({
          ...error,
          timestamp: new Date(error.timestamp)
        }))
      }
    } catch (error) {
      console.warn('Failed to load errors from localStorage:', error)
    }
  }

  /**
   * 导出错误数据
   * @param format 导出格式
   * @returns 导出的数据
   */
  exportErrors(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['ID', 'Type', 'Severity', 'Message', 'Timestamp', 'URL']
      const rows = this.errors.map(error => [
        error.id,
        error.type,
        error.severity,
        error.message.replace(/,/g, ';'),
        error.timestamp.toISOString(),
        error.url || ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(this.errors, null, 2)
  }

  /**
   * 创建自定义错误
   * @param type 错误类型
   * @param message 错误消息
   * @param severity 严重程度
   * @param context 上下文
   * @returns 应用错误
   */
  createError(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>
  ): AppError {
    return {
      id: this.generateErrorId(),
      type,
      severity,
      message,
      timestamp: new Date(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  }
}

// 创建全局错误服务实例
export const errorService = new ErrorService()

/**
 * 控制台错误处理器
 */
export class ConsoleErrorHandler implements ErrorHandler {
  canHandle(): boolean {
    return !import.meta.env.PROD
  }

  handle(error: AppError): void {
    const style = this.getConsoleStyle(error.severity)
    console.group(`%c${error.severity.toUpperCase()} - ${error.type}`, style)
    console.log('Message:', error.message)
    console.log('Details:', error.details)
    console.log('Timestamp:', error.timestamp)
    console.log('Context:', error.context)
    if (error.stack) {
      console.log('Stack:', error.stack)
    }
    console.groupEnd()
  }

  private getConsoleStyle(severity: ErrorSeverity): string {
    const styles = {
      [ErrorSeverity.LOW]: 'color: #909399; font-weight: normal;',
      [ErrorSeverity.MEDIUM]: 'color: #E6A23C; font-weight: bold;',
      [ErrorSeverity.HIGH]: 'color: #F56C6C; font-weight: bold;',
      [ErrorSeverity.CRITICAL]: 'color: #F56C6C; font-weight: bold; background: #FEF0F0; padding: 2px 4px;'
    }
    return styles[severity]
  }
}

/**
 * 通知错误处理器
 */
export class NotificationErrorHandler implements ErrorHandler {
  private notificationCallback?: (error: AppError) => void

  constructor(notificationCallback?: (error: AppError) => void) {
    this.notificationCallback = notificationCallback
  }

  canHandle(error: AppError): boolean {
    return error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL
  }

  handle(error: AppError): void {
    if (this.notificationCallback) {
      this.notificationCallback(error)
    }
  }

  setNotificationCallback(callback: (error: AppError) => void): void {
    this.notificationCallback = callback
  }
}

/**
 * 远程日志错误处理器
 */
export class RemoteLogErrorHandler implements ErrorHandler {
  private endpoint: string
  private apiKey?: string

  constructor(endpoint: string, apiKey?: string) {
    this.endpoint = endpoint
    this.apiKey = apiKey
  }

  canHandle(error: AppError): boolean {
    return error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL
  }

  async handle(error: AppError): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          error,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })
    } catch (logError) {
      console.warn('Failed to send error to remote log:', logError)
    }
  }
}

/**
 * 初始化错误服务
 * @param options 配置选项
 */
export function initializeErrorService(options?: {
  enableConsoleHandler?: boolean
  enableNotificationHandler?: boolean
  notificationCallback?: (error: AppError) => void
  remoteLogEndpoint?: string
  remoteLogApiKey?: string
}): void {
  // 加载历史错误
  errorService.loadErrorsFromStorage()

  // 注册默认处理器
  if (options?.enableConsoleHandler !== false) {
    errorService.registerHandler(new ConsoleErrorHandler())
  }

  if (options?.enableNotificationHandler) {
    errorService.registerHandler(new NotificationErrorHandler(options.notificationCallback))
  }

  if (options?.remoteLogEndpoint) {
    errorService.registerHandler(
      new RemoteLogErrorHandler(options.remoteLogEndpoint, options.remoteLogApiKey)
    )
  }

  // 全局错误捕获
  window.addEventListener('error', (event) => {
    errorService.handleError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    errorService.handleError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { type: 'unhandledPromiseRejection' }
    )
  })
}

/**
 * 错误边界组合式函数
 * @param handler 错误处理函数
 * @returns 错误边界函数
 */
export function useErrorBoundary(handler?: (error: Error) => void) {
  const handleError = (error: Error, context?: Record<string, any>) => {
    errorService.handleError(error, context)
    if (handler) {
      handler(error)
    }
  }

  return {
    handleError,
    createError: errorService.createError.bind(errorService),
    getErrors: errorService.getErrors.bind(errorService),
    getErrorStats: errorService.getErrorStats.bind(errorService),
    clearErrors: errorService.clearErrors.bind(errorService)
  }
}

/**
 * 异步操作错误包装器
 * @param operation 异步操作
 * @param context 上下文信息
 * @returns 包装后的操作
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    await errorService.handleError(error as Error, context)
    throw error
  }
}

/**
 * 同步操作错误包装器
 * @param operation 同步操作
 * @param context 上下文信息
 * @returns 包装后的操作结果
 */
export function withSyncErrorHandling<T>(
  operation: () => T,
  context?: Record<string, any>
): T {
  try {
    return operation()
  } catch (error) {
    errorService.handleError(error as Error, context)
    throw error
  }
}

// 错误类型和严重程度枚举已在上面定义并导出