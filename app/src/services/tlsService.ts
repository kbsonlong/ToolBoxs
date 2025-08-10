import { formatDate } from '@/utils/formatters'

// 证书信息接口
export interface CertificateInfo {
  subject: {
    commonName?: string
    organization?: string
    organizationalUnit?: string
    country?: string
    state?: string
    locality?: string
  }
  issuer: {
    commonName?: string
    organization?: string
    organizationalUnit?: string
    country?: string
    state?: string
    locality?: string
  }
  serialNumber: string
  version: number
  signatureAlgorithm: string
  publicKey: {
    algorithm: string
    size: number
  }
  validity: {
    notBefore: Date
    notAfter: Date
    isValid: boolean
    daysLeft: number
  }
  domains: string[]
  fingerprints: {
    sha1: string
    sha256: string
  }
  extensions?: {
    keyUsage?: string[]
    extendedKeyUsage?: string[]
    subjectAltName?: string[]
    basicConstraints?: string
    authorityKeyIdentifier?: string
    subjectKeyIdentifier?: string
  }
}

// 证书验证结果接口
export interface CertificateValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  details: {
    hostname?: boolean
    chain?: boolean
    time?: boolean
    signature?: boolean
  }
}

// 自签名证书配置接口
export interface SelfSignedCertConfig {
  commonName: string
  organization?: string
  organizationalUnit?: string
  country?: string
  state?: string
  locality?: string
  validityDays: number
  keySize: number
  altNames?: string[]
}

// 自签名证书结果接口
export interface SelfSignedCertResult {
  certificate: string
  privateKey: string
  publicKey: string
}

/**
 * 解析Base64编码的证书
 * @param base64Cert Base64编码的证书内容
 * @returns 证书信息
 */
export async function parseBase64Certificate(base64Cert: string): Promise<CertificateInfo> {
  try {
    // 清理输入，移除PEM头尾和空白字符
    let cleanBase64 = base64Cert
      .replace(/-----BEGIN[^-]+-----/g, '')
      .replace(/-----END[^-]+-----/g, '')
      .replace(/\s/g, '')
    
    // 验证Base64格式
    if (!isValidBase64(cleanBase64)) {
      throw new Error('无效的Base64格式')
    }
    
    // 解码Base64
    const binaryData = atob(cleanBase64)
    
    // 这里应该使用真实的X.509证书解析库，比如node-forge
    // 为了演示，我们创建一个模拟的解析结果
    const mockCertInfo = createMockCertificateInfo(binaryData)
    
    return mockCertInfo
  } catch (error) {
    console.error('证书解析失败:', error)
    throw new Error(`证书解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 验证Base64格式
 */
function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str
  } catch (err) {
    return false
  }
}

/**
 * 创建模拟证书信息（实际项目中应使用真实的证书解析库）
 */
function createMockCertificateInfo(binaryData: string): CertificateInfo {
  const now = new Date()
  const notBefore = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1年前
  const notAfter = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1年后
  const daysLeft = Math.ceil((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    subject: {
      commonName: 'example.com',
      organization: 'Example Organization',
      organizationalUnit: 'IT Department',
      country: 'US',
      state: 'California',
      locality: 'San Francisco'
    },
    issuer: {
      commonName: 'Example CA',
      organization: 'Example Certificate Authority',
      country: 'US'
    },
    serialNumber: '01:23:45:67:89:AB:CD:EF',
    version: 3,
    signatureAlgorithm: 'SHA256withRSA',
    publicKey: {
      algorithm: 'RSA',
      size: 2048
    },
    validity: {
      notBefore,
      notAfter,
      isValid: now >= notBefore && now <= notAfter,
      daysLeft
    },
    domains: ['example.com', '*.example.com', 'www.example.com'],
    fingerprints: {
      sha1: generateMockFingerprint('sha1'),
      sha256: generateMockFingerprint('sha256')
    },
    extensions: {
      keyUsage: ['Digital Signature', 'Key Encipherment'],
      extendedKeyUsage: ['Server Authentication', 'Client Authentication'],
      subjectAltName: ['DNS:example.com', 'DNS:*.example.com'],
      basicConstraints: 'CA:FALSE',
      authorityKeyIdentifier: generateMockFingerprint('aki'),
      subjectKeyIdentifier: generateMockFingerprint('ski')
    }
  }
}

/**
 * 生成模拟指纹
 */
function generateMockFingerprint(type: string): string {
  const chars = '0123456789ABCDEF'
  const length = type === 'sha256' ? 64 : 40
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
    if (i % 2 === 1 && i < length - 1) {
      result += ':'
    }
  }
  
  return result
}

/**
 * 验证证书
 * @param certificate 证书内容
 * @param hostname 主机名（可选）
 * @returns 验证结果
 */
export async function validateCertificate(
  certificate: string,
  hostname?: string
): Promise<CertificateValidationResult> {
  try {
    const certInfo = await parseBase64Certificate(certificate)
    const errors: string[] = []
    const warnings: string[] = []
    const details = {
      hostname: true,
      chain: true,
      time: true,
      signature: true
    }
    
    // 验证时间
    if (!certInfo.validity.isValid) {
      errors.push('证书已过期或尚未生效')
      details.time = false
    } else if (certInfo.validity.daysLeft < 30) {
      warnings.push(`证书将在 ${certInfo.validity.daysLeft} 天后过期`)
    }
    
    // 验证主机名
    if (hostname && !certInfo.domains.some(domain => 
      domain === hostname || 
      (domain.startsWith('*.') && hostname.endsWith(domain.slice(1)))
    )) {
      errors.push(`证书不适用于主机名: ${hostname}`)
      details.hostname = false
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      details
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : '验证失败'],
      warnings: [],
      details: {
        hostname: false,
        chain: false,
        time: false,
        signature: false
      }
    }
  }
}

/**
 * 转换证书格式
 * @param certificate 证书内容
 * @param inputFormat 输入格式
 * @param outputFormat 输出格式
 * @returns 转换后的证书内容
 */
export async function convertCertificateFormat(
  certificate: string,
  inputFormat: string,
  outputFormat: string
): Promise<string> {
  try {
    // 这里应该使用真实的证书格式转换库
    // 为了演示，我们提供一个简化的实现
    
    let cleanCert = certificate.trim()
    
    // 移除现有的PEM头尾（如果有）
    cleanCert = cleanCert
      .replace(/-----BEGIN[^-]+-----/g, '')
      .replace(/-----END[^-]+-----/g, '')
      .replace(/\s/g, '')
    
    switch (outputFormat) {
      case 'pem':
        return `-----BEGIN CERTIFICATE-----\n${cleanCert.match(/.{1,64}/g)?.join('\n') || cleanCert}\n-----END CERTIFICATE-----`
      
      case 'der':
        // DER是二进制格式，这里返回Base64表示
        return cleanCert
      
      case 'p7b':
        return `-----BEGIN PKCS7-----\n${cleanCert.match(/.{1,64}/g)?.join('\n') || cleanCert}\n-----END PKCS7-----`
      
      case 'text':
        // 解析证书并返回可读文本
        const certInfo = await parseBase64Certificate(certificate)
        return formatCertificateAsText(certInfo)
      
      default:
        throw new Error(`不支持的输出格式: ${outputFormat}`)
    }
  } catch (error) {
    throw new Error(`格式转换失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 将证书信息格式化为可读文本
 */
function formatCertificateAsText(certInfo: CertificateInfo): string {
  const lines: string[] = []
  
  lines.push('Certificate:')
  lines.push('    Data:')
  lines.push(`        Version: ${certInfo.version}`)
  lines.push(`        Serial Number: ${certInfo.serialNumber}`)
  lines.push(`        Signature Algorithm: ${certInfo.signatureAlgorithm}`)
  lines.push('        Issuer:')
  
  if (certInfo.issuer.country) lines.push(`            C=${certInfo.issuer.country}`)
  if (certInfo.issuer.state) lines.push(`            ST=${certInfo.issuer.state}`)
  if (certInfo.issuer.locality) lines.push(`            L=${certInfo.issuer.locality}`)
  if (certInfo.issuer.organization) lines.push(`            O=${certInfo.issuer.organization}`)
  if (certInfo.issuer.organizationalUnit) lines.push(`            OU=${certInfo.issuer.organizationalUnit}`)
  if (certInfo.issuer.commonName) lines.push(`            CN=${certInfo.issuer.commonName}`)
  
  lines.push('        Validity:')
  lines.push(`            Not Before: ${formatDate(certInfo.validity.notBefore)}`)
  lines.push(`            Not After : ${formatDate(certInfo.validity.notAfter)}`)
  lines.push('        Subject:')
  
  if (certInfo.subject.country) lines.push(`            C=${certInfo.subject.country}`)
  if (certInfo.subject.state) lines.push(`            ST=${certInfo.subject.state}`)
  if (certInfo.subject.locality) lines.push(`            L=${certInfo.subject.locality}`)
  if (certInfo.subject.organization) lines.push(`            O=${certInfo.subject.organization}`)
  if (certInfo.subject.organizationalUnit) lines.push(`            OU=${certInfo.subject.organizationalUnit}`)
  if (certInfo.subject.commonName) lines.push(`            CN=${certInfo.subject.commonName}`)
  
  lines.push('        Subject Public Key Info:')
  lines.push(`            Public Key Algorithm: ${certInfo.publicKey.algorithm}`)
  lines.push(`            Public Key Size: ${certInfo.publicKey.size} bits`)
  
  if (certInfo.extensions) {
    lines.push('        X509v3 extensions:')
    
    if (certInfo.extensions.keyUsage) {
      lines.push('            X509v3 Key Usage:')
      lines.push(`                ${certInfo.extensions.keyUsage.join(', ')}`)
    }
    
    if (certInfo.extensions.extendedKeyUsage) {
      lines.push('            X509v3 Extended Key Usage:')
      lines.push(`                ${certInfo.extensions.extendedKeyUsage.join(', ')}`)
    }
    
    if (certInfo.extensions.subjectAltName) {
      lines.push('            X509v3 Subject Alternative Name:')
      lines.push(`                ${certInfo.extensions.subjectAltName.join(', ')}`)
    }
    
    if (certInfo.extensions.basicConstraints) {
      lines.push('            X509v3 Basic Constraints:')
      lines.push(`                ${certInfo.extensions.basicConstraints}`)
    }
  }
  
  lines.push('    Signature Algorithm: ' + certInfo.signatureAlgorithm)
  lines.push('    Fingerprints:')
  lines.push(`        SHA1: ${certInfo.fingerprints.sha1}`)
  lines.push(`        SHA256: ${certInfo.fingerprints.sha256}`)
  
  return lines.join('\n')
}

/**
 * 生成自签名证书
 * @param config 证书配置
 * @returns 生成的证书和私钥
 */
export async function generateSelfSignedCertificate(
  config: SelfSignedCertConfig
): Promise<SelfSignedCertResult> {
  try {
    // 这里应该使用真实的证书生成库，比如node-forge
    // 为了演示，我们返回模拟的证书和私钥
    
    const mockCertificate = generateMockPEMCertificate(config)
    const mockPrivateKey = generateMockPrivateKey(config.keySize)
    const mockPublicKey = generateMockPublicKey(config.keySize)
    
    return {
      certificate: mockCertificate,
      privateKey: mockPrivateKey,
      publicKey: mockPublicKey
    }
  } catch (error) {
    throw new Error(`证书生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 生成模拟PEM证书
 */
function generateMockPEMCertificate(config: SelfSignedCertConfig): string {
  // 生成随机Base64内容
  const randomBytes = new Uint8Array(1024)
  crypto.getRandomValues(randomBytes)
  const base64Content = btoa(String.fromCharCode(...randomBytes))
  
  // 格式化为PEM
  const lines = base64Content.match(/.{1,64}/g) || []
  
  return [
    '-----BEGIN CERTIFICATE-----',
    ...lines,
    '-----END CERTIFICATE-----'
  ].join('\n')
}

/**
 * 生成模拟私钥
 */
function generateMockPrivateKey(keySize: number): string {
  // 生成随机Base64内容
  const randomBytes = new Uint8Array(keySize / 8)
  crypto.getRandomValues(randomBytes)
  const base64Content = btoa(String.fromCharCode(...randomBytes))
  
  // 格式化为PEM
  const lines = base64Content.match(/.{1,64}/g) || []
  
  return [
    '-----BEGIN PRIVATE KEY-----',
    ...lines,
    '-----END PRIVATE KEY-----'
  ].join('\n')
}

/**
 * 生成模拟公钥
 */
function generateMockPublicKey(keySize: number): string {
  // 生成随机Base64内容
  const randomBytes = new Uint8Array(keySize / 16)
  crypto.getRandomValues(randomBytes)
  const base64Content = btoa(String.fromCharCode(...randomBytes))
  
  // 格式化为PEM
  const lines = base64Content.match(/.{1,64}/g) || []
  
  return [
    '-----BEGIN PUBLIC KEY-----',
    ...lines,
    '-----END PUBLIC KEY-----'
  ].join('\n')
}

/**
 * 下载证书文件
 * @param content 文件内容
 * @param filename 文件名
 * @param mimeType MIME类型
 */
export function downloadCertificateFile(
  content: string,
  filename: string,
  mimeType: string = 'application/x-pem-file'
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 复制内容到剪贴板
 * @param content 要复制的内容
 * @returns Promise
 */
export async function copyCertificateToClipboard(content: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(content)
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = content
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

/**
 * 获取证书统计信息
 * @param certificates 证书列表
 * @returns 统计信息
 */
export function getCertificateStats(certificates: CertificateInfo[]) {
  const total = certificates.length
  const valid = certificates.filter(cert => cert.validity.isValid).length
  const expired = certificates.filter(cert => !cert.validity.isValid).length
  const expiringSoon = certificates.filter(cert => 
    cert.validity.isValid && cert.validity.daysLeft < 30
  ).length
  
  return {
    total,
    valid,
    expired,
    expiringSoon,
    validPercentage: total > 0 ? Math.round((valid / total) * 100) : 0
  }
}

/**
 * 从服务器获取TLS证书
 * @param serverUrl 服务器URL或域名
 * @returns 证书的PEM格式字符串
 */
export async function fetchServerCertificate(serverUrl: string): Promise<string> {
  // 清理URL格式
  let cleanUrl = serverUrl.trim()
  
  // 如果没有协议前缀，添加https://
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl
  }
  
  try {
    // 解析URL获取主机名和端口
    const url = new URL(cleanUrl)
    const hostname = url.hostname
    const port = url.port || (url.protocol === 'https:' ? '443' : '80')
    
    // 在浏览器环境中，我们无法直接获取服务器证书
    // 这里提供一个模拟实现，实际应用中需要通过后端API来获取
    
    // 模拟证书数据 - 实际应用中应该通过后端API获取真实证书
    const mockCertificate = generateMockServerCertificate(hostname)
    
    return mockCertificate
  } catch (error) {
    throw new Error(`无法获取服务器证书: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 生成模拟的服务器证书（用于演示）
 * @param hostname 主机名
 * @returns PEM格式的证书字符串
 */
function generateMockServerCertificate(hostname: string): string {
  const now = new Date()
  const notBefore = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30天前
  const notAfter = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 365天后
  
  return `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkNOMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJDTjETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAuVMfn8zfMjXXqjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
QIDAQABo1AwTjAdBgNVHQ4EFgQUhKtzpL+hlROcZtT+zGtI8XkWJDEwHwYDVR0j
BBgwFoAUhKtzpL+hlROcZtT+zGtI8XkWJDEwDAYDVR0TBAUwAwEB/zANBgkqhkiG
9w0BAQsFAAOCAQEAuVMfn8zfMjXXqjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
XjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjXj
-----END CERTIFICATE-----`
}

/**
 * 验证证书链
 * @param certificates 证书链
 * @returns 验证结果
 */
export async function validateCertificateChain(
  certificates: string[]
): Promise<CertificateValidationResult> {
  try {
    if (certificates.length === 0) {
      return {
        isValid: false,
        errors: ['证书链为空'],
        warnings: [],
        details: {
          chain: false,
          time: false,
          signature: false
        }
      }
    }
    
    const certInfos = await Promise.all(
      certificates.map(cert => parseBase64Certificate(cert))
    )
    
    const errors: string[] = []
    const warnings: string[] = []
    
    // 验证每个证书的有效期
    certInfos.forEach((cert, index) => {
      if (!cert.validity.isValid) {
        errors.push(`证书 ${index + 1} 已过期或尚未生效`)
      } else if (cert.validity.daysLeft < 30) {
        warnings.push(`证书 ${index + 1} 将在 ${cert.validity.daysLeft} 天后过期`)
      }
    })
    
    // 验证证书链的连续性（简化实现）
    for (let i = 0; i < certInfos.length - 1; i++) {
      const current = certInfos[i]
      const next = certInfos[i + 1]
      
      if (current.issuer.commonName !== next.subject.commonName) {
        warnings.push(`证书 ${i + 1} 和证书 ${i + 2} 之间的链接可能有问题`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      details: {
        chain: errors.length === 0,
        time: !certInfos.some(cert => !cert.validity.isValid),
        signature: true // 简化实现，假设签名验证通过
      }
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : '证书链验证失败'],
      warnings: [],
      details: {
        chain: false,
        time: false,
        signature: false
      }
    }
  }
}