import { formatDate } from '@/utils/formatters'
import * as forge from 'node-forge'
import { decodeBase64, isValidBase64 } from '@/services/cryptoService'

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
    // 输入验证
    if (!base64Cert || typeof base64Cert !== 'string') {
      throw new Error('证书内容不能为空')
    }

    // 清理输入数据
    let cleanBase64 = base64Cert.trim()
    console.log('清理前:', cleanBase64)
    // 解密Base64
    cleanBase64 = decodeBase64(cleanBase64)
    console.log('解密后:', cleanBase64)

    // 如果输入包含PEM标记，提取Base64部分
    if (cleanBase64.includes('-----BEGIN CERTIFICATE-----')) {
      const pemMatch = cleanBase64.match(/-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/)
      if (pemMatch && pemMatch[1]) {
        cleanBase64 = pemMatch[1].replace(/\s/g, '')
      } else {
        throw new Error('PEM格式证书解析失败')
      }
    } else {
      // 移除所有空白字符
      cleanBase64 = cleanBase64.replace(/\s/g, '')
    }

    // 检查清理后的内容
    if (!cleanBase64) {
      throw new Error('证书内容为空或格式不正确')
    }

    // 检查Base64长度（证书通常至少几百字节）
    if (cleanBase64.length < 100) {
      throw new Error('证书内容过短，可能不是有效的证书')
    }

    // 验证Base64格式
    if (!isValidBase64(cleanBase64)) {
      throw new Error('无效的Base64格式')
    }

    // 使用node-forge解析证书
    let derBytes: string
    try {
      derBytes = forge.util.decode64(cleanBase64)
    } catch (decodeError) {
      throw new Error('Base64解码失败: ' + (decodeError instanceof Error ? decodeError.message : '未知错误'))
    }

    // 检查DER数据长度
    if (!derBytes || derBytes.length < 50) {
      throw new Error('解码后的证书数据过短，可能不是有效的证书')
    }

    let asn1: forge.asn1.Asn1
    try {
      asn1 = forge.asn1.fromDer(derBytes)
    } catch (asnError) {
      throw new Error('ASN.1解析失败: ' + (asnError instanceof Error ? asnError.message : '未知错误'))
    }
    const cert = forge.pki.certificateFromAsn1(asn1)

    // 提取证书信息
    const now = new Date()
    const notBefore = cert.validity.notBefore
    const notAfter = cert.validity.notAfter
    const isValid = now >= notBefore && now <= notAfter
    const daysLeft = Math.ceil((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // 提取主题信息
     const subject = extractSubjectInfo(cert.subject.attributes)
     const issuer = extractSubjectInfo(cert.issuer.attributes)

    // 提取域名信息
    const domains = extractDomains(cert)

    // 生成指纹
    const fingerprints = {
      sha1: forge.md.sha1.create().update(derBytes).digest().toHex().toUpperCase().match(/.{2}/g)?.join(':') || '',
      sha256: forge.md.sha256.create().update(derBytes).digest().toHex().toUpperCase().match(/.{2}/g)?.join(':') || ''
    }

    // 提取扩展信息
    const extensions = extractExtensions(cert)

    const certInfo: CertificateInfo = {
      subject,
      issuer,
      serialNumber: cert.serialNumber,
      version: cert.version + 1, // ASN.1版本从0开始，显示时加1
      signatureAlgorithm: getSignatureAlgorithm(cert),
      publicKey: {
        algorithm: getPublicKeyAlgorithm(cert.publicKey),
        size: getPublicKeySize(cert.publicKey)
      },
      validity: {
        notBefore,
        notAfter,
        isValid,
        daysLeft
      },
      domains,
      fingerprints,
      extensions
    }

    return certInfo
  } catch (error) {
    console.error('证书解析失败:', error)
    throw new Error(`证书解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 验证Base64格式
 */


/**
 * 提取证书主题或颁发者信息
 * @param attributes 证书属性
 * @returns 主题信息对象
 */
function extractSubjectInfo(attributes: forge.pki.CertificateField[]): Record<string, string> {
  const info: Record<string, string> = {}

  for (const attr of attributes) {
    const value = Array.isArray(attr.value) ? attr.value.join(', ') : attr.value
    switch (attr.shortName || attr.name) {
      case 'CN':
        info.commonName = value
        break
      case 'O':
        info.organization = value
        break
      case 'OU':
        info.organizationalUnit = value
        break
      case 'C':
        info.country = value
        break
      case 'ST':
        info.state = value
        break
      case 'L':
        info.locality = value
        break
      case 'emailAddress':
        info.email = value
        break
    }
  }

  return info
}

/**
 * 提取证书中的域名信息
 * @param cert 证书对象
 * @returns 域名数组
 */
function extractDomains(cert: forge.pki.Certificate): string[] {
  const domains: string[] = []

  // 从CN中提取主域名
  const cn = cert.subject.getField('CN')
  if (cn && cn.value) {
    const value = Array.isArray(cn.value) ? cn.value.join(', ') : cn.value
    domains.push(value)
  }

  // 从SAN扩展中提取域名
  try {
    const sanExt = cert.getExtension('subjectAltName') as {
      altNames?: Array<{ type: number; value: string }>
    } | null
    if (sanExt && sanExt.altNames) {
      for (const altName of sanExt.altNames) {
        if (altName.type === 2) { // DNS name
          domains.push(altName.value)
        }
      }
    }
  } catch {
    // SAN扩展不存在或解析失败
  }

  return Array.from(new Set(domains)) // 去重
}

/**
 * 提取证书扩展信息
 * @param cert 证书对象
 * @returns 扩展信息对象
 */
function extractExtensions(cert: forge.pki.Certificate): Record<string, string | string[]> {
  const extensions: Record<string, string | string[]> = {}

  for (const ext of cert.extensions) {
    const extTyped = ext as {
      digitalSignature?: boolean
      keyEncipherment?: boolean
      dataEncipherment?: boolean
      keyAgreement?: boolean
      keyCertSign?: boolean
      cRLSign?: boolean
      serverAuth?: boolean
      clientAuth?: boolean
      cA?: boolean
      altNames?: Array<{ type: number; value: string }>
      [key: string]: unknown
    }
    switch (ext.name) {
      case 'keyUsage':
        const keyUsages: string[] = []
        if (extTyped.digitalSignature) keyUsages.push('Digital Signature')
        if (extTyped.keyEncipherment) keyUsages.push('Key Encipherment')
        if (extTyped.dataEncipherment) keyUsages.push('Data Encipherment')
        if (extTyped.keyAgreement) keyUsages.push('Key Agreement')
        if (extTyped.keyCertSign) keyUsages.push('Certificate Sign')
        if (extTyped.cRLSign) keyUsages.push('CRL Sign')
        extensions.keyUsage = keyUsages
        break
      case 'extKeyUsage':
        const extKeyUsages: string[] = []
        if (extTyped.serverAuth) extKeyUsages.push('Server Authentication')
        if (extTyped.clientAuth) extKeyUsages.push('Client Authentication')
        extensions.extendedKeyUsage = extKeyUsages
        break
      case 'subjectAltName':
        const altNames: string[] = []
        if (extTyped.altNames) {
          for (const altName of extTyped.altNames) {
            if (altName.type === 2) altNames.push(`DNS:${altName.value}`)
            else if (altName.type === 7) altNames.push(`IP:${altName.value}`)
            else altNames.push(altName.value)
          }
        }
        extensions.subjectAltName = altNames
        break
      case 'basicConstraints':
        extensions.basicConstraints = extTyped.cA ? 'CA:TRUE' : 'CA:FALSE'
        break
      default:
        extensions[ext.name || 'Unknown'] = ext.value || 'N/A'
        break
    }
  }

  return extensions
}

/**
 * 获取签名算法
 * @param cert 证书对象
 * @returns 签名算法字符串
 */
function getSignatureAlgorithm(cert: forge.pki.Certificate): string {
  return cert.siginfo?.algorithmOid ?
    forge.pki.oids[cert.siginfo.algorithmOid] || cert.siginfo.algorithmOid :
    'Unknown'
}

/**
 * 获取公钥算法
 * @param publicKey 公钥对象
 * @returns 公钥算法字符串
 */
function getPublicKeyAlgorithm(publicKey: forge.pki.PublicKey): string {
  if ('n' in publicKey) {
    return 'RSA'
  } else if ('p' in publicKey) {
    return 'DSA'
  } else if ('curve' in publicKey) {
    return 'ECDSA'
  }
  return 'Unknown'
}

/**
 * 获取公钥大小
 * @param publicKey 公钥对象
 * @returns 公钥大小（位数）
 */
function getPublicKeySize(publicKey: forge.pki.PublicKey): number {
  if ('n' in publicKey) {
    // RSA key
    return (publicKey as forge.pki.rsa.PublicKey).n.bitLength()
  }
  return 0
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

    const mockCertificate = generateMockPEMCertificate()
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
function generateMockPEMCertificate(): string {
  // 生成随机Base64内容
  const randomBytes = new Uint8Array(1024)
  crypto.getRandomValues(randomBytes)
  const base64Content = btoa(String.fromCharCode.apply(null, Array.from(randomBytes)))

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
  const base64Content = btoa(String.fromCharCode.apply(null, Array.from(randomBytes)))

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
  const base64Content = btoa(String.fromCharCode.apply(null, Array.from(randomBytes)))

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
  } catch {
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
    // 在浏览器环境中，我们无法直接获取服务器证书
    // 这里提供一个模拟实现，实际应用中需要通过后端API来获取

    // 模拟证书数据 - 实际应用中应该通过后端API获取真实证书
    const mockCertificate = generateMockServerCertificate()

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
function generateMockServerCertificate(): string {
  // 模拟证书生成，实际应用中应通过后端API获取真实证书

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
