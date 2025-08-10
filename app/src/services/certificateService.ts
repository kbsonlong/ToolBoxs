/**
 * 证书服务
 * 提供TLS证书解析和验证功能
 */

import * as forge from 'node-forge'
import { isValidCertificate, isValidURL } from '@/utils/validators'
import { formatCertificateInfo, formatError } from '@/utils/formatters'

/**
 * 证书信息接口
 */
export interface CertificateInfo {
  subject: {
    commonName: string
    organization: string
    organizationalUnit: string
    locality: string
    state: string
    country: string
    emailAddress: string
  }
  issuer: {
    commonName: string
    organization: string
    organizationalUnit: string
    locality: string
    state: string
    country: string
  }
  validity: {
    notBefore: Date
    notAfter: Date
    isValid: boolean
    daysUntilExpiry: number
    isExpired: boolean
  }
  fingerprints: {
    sha1: string
    sha256: string
    md5: string
  }
  publicKey: {
    algorithm: string
    size: number
    exponent: string
    modulus?: string
  }
  extensions: Array<{
    name: string
    value: string
    critical: boolean
  }>
  serialNumber: string
  version: number
  signatureAlgorithm: string
  raw: {
    pem: string
    der: string
  }
}

/**
 * 证书验证结果
 */
export interface CertificateValidationResult {
  isValid: boolean
  certificate?: CertificateInfo
  errors: string[]
  warnings: string[]
  securityLevel: 'high' | 'medium' | 'low' | 'critical'
  recommendations: string[]
}

/**
 * 在线证书检查结果
 */
export interface OnlineCertificateResult {
  success: boolean
  hostname: string
  port: number
  certificates: CertificateInfo[]
  chain: {
    length: number
    isComplete: boolean
    isTrusted: boolean
  }
  protocols: {
    supported: string[]
    recommended: string[]
    deprecated: string[]
  }
  cipherSuites: {
    supported: string[]
    secure: string[]
    weak: string[]
  }
  vulnerabilities: Array<{
    name: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
  }>
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  error?: string
}

/**
 * 解析PEM格式证书
 * @param pemData PEM格式证书数据
 * @returns 证书信息
 */
export function parsePEMCertificate(pemData: string): CertificateValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  
  try {
    // 验证PEM格式
    if (!isValidCertificate(pemData)) {
      errors.push('无效的PEM格式证书')
      return {
        isValid: false,
        errors,
        warnings,
        securityLevel: 'critical',
        recommendations
      }
    }
    
    // 解析证书
    const cert = forge.pki.certificateFromPem(pemData)
    
    // 提取基本信息
    const subject = extractDistinguishedName(cert.subject)
    const issuer = extractDistinguishedName(cert.issuer)
    
    // 计算有效期信息
    const now = new Date()
    const notBefore = cert.validity.notBefore
    const notAfter = cert.validity.notAfter
    const isValid = now >= notBefore && now <= notAfter
    const daysUntilExpiry = Math.ceil((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpired = now > notAfter
    
    // 计算指纹
    const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
    const fingerprints = {
      sha1: forge.md.sha1.create().update(der).digest().toHex().toUpperCase().match(/.{2}/g)?.join(':') || '',
      sha256: forge.md.sha256.create().update(der).digest().toHex().toUpperCase().match(/.{2}/g)?.join(':') || '',
      md5: forge.md.md5.create().update(der).digest().toHex().toUpperCase().match(/.{2}/g)?.join(':') || ''
    }
    
    // 提取公钥信息
    const publicKey = extractPublicKeyInfo(cert.publicKey)
    
    // 提取扩展信息
    const extensions = extractExtensions(cert.extensions)
    
    // 构建证书信息
    const certificateInfo: CertificateInfo = {
      subject,
      issuer,
      validity: {
        notBefore,
        notAfter,
        isValid,
        daysUntilExpiry,
        isExpired
      },
      fingerprints,
      publicKey,
      extensions,
      serialNumber: cert.serialNumber,
      version: cert.version + 1, // forge使用0-based版本号
      signatureAlgorithm: forge.pki.oids[cert.signatureOid] || cert.signatureOid,
      raw: {
        pem: pemData,
        der: forge.util.encode64(der)
      }
    }
    
    // 安全性检查
    const securityAnalysis = analyzeCertificateSecurity(certificateInfo)
    errors.push(...securityAnalysis.errors)
    warnings.push(...securityAnalysis.warnings)
    recommendations.push(...securityAnalysis.recommendations)
    
    return {
      isValid: errors.length === 0,
      certificate: certificateInfo,
      errors,
      warnings,
      securityLevel: securityAnalysis.securityLevel,
      recommendations
    }
  } catch (error) {
    errors.push(`证书解析失败: ${formatError(error)}`)
    return {
      isValid: false,
      errors,
      warnings,
      securityLevel: 'critical',
      recommendations
    }
  }
}

/**
 * 解析Base64编码的证书
 * @param base64Data Base64编码的证书数据
 * @returns 证书信息
 */
export function parseBase64Certificate(base64Data: string): CertificateValidationResult {
  try {
    // 清理Base64数据
    const cleanBase64 = base64Data.replace(/\s/g, '')
    
    // 转换为PEM格式
    const pemData = `-----BEGIN CERTIFICATE-----\n${cleanBase64.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`
    
    return parsePEMCertificate(pemData)
  } catch (error) {
    return {
      isValid: false,
      errors: [`Base64证书解析失败: ${formatError(error)}`],
      warnings: [],
      securityLevel: 'critical',
      recommendations: []
    }
  }
}

/**
 * 提取证书主体/颁发者信息
 * @param attributes 属性数组
 * @returns 格式化的信息
 */
function extractDistinguishedName(attributes: any[]): any {
  const result: any = {
    commonName: '',
    organization: '',
    organizationalUnit: '',
    locality: '',
    state: '',
    country: '',
    emailAddress: ''
  }
  
  for (const attr of attributes) {
    switch (attr.type || attr.shortName) {
      case 'CN':
      case '2.5.4.3':
        result.commonName = attr.value
        break
      case 'O':
      case '2.5.4.10':
        result.organization = attr.value
        break
      case 'OU':
      case '2.5.4.11':
        result.organizationalUnit = attr.value
        break
      case 'L':
      case '2.5.4.7':
        result.locality = attr.value
        break
      case 'ST':
      case '2.5.4.8':
        result.state = attr.value
        break
      case 'C':
      case '2.5.4.6':
        result.country = attr.value
        break
      case 'emailAddress':
      case '1.2.840.113549.1.9.1':
        result.emailAddress = attr.value
        break
    }
  }
  
  return result
}

/**
 * 提取公钥信息
 * @param publicKey 公钥对象
 * @returns 公钥信息
 */
function extractPublicKeyInfo(publicKey: any): any {
  const result: any = {
    algorithm: 'Unknown',
    size: 0,
    exponent: ''
  }
  
  if (publicKey.n && publicKey.e) {
    // RSA公钥
    result.algorithm = 'RSA'
    result.size = publicKey.n.bitLength()
    result.exponent = publicKey.e.toString()
    result.modulus = publicKey.n.toString(16).toUpperCase()
  } else if (publicKey.curve) {
    // ECC公钥
    result.algorithm = 'ECC'
    result.size = publicKey.curve.length || 256
  }
  
  return result
}

/**
 * 提取证书扩展信息
 * @param extensions 扩展数组
 * @returns 格式化的扩展信息
 */
function extractExtensions(extensions: any[]): Array<{
  name: string
  value: string
  critical: boolean
}> {
  const result: Array<{
    name: string
    value: string
    critical: boolean
  }> = []
  
  for (const ext of extensions) {
    const name = getExtensionName(ext.id)
    let value = ''
    
    try {
      if (ext.subjectAltName) {
        value = ext.subjectAltName.map((alt: any) => `${alt.type}:${alt.value}`).join(', ')
      } else if (ext.keyUsage) {
        value = Object.keys(ext.keyUsage).filter(key => ext.keyUsage[key]).join(', ')
      } else if (ext.extKeyUsage) {
        value = ext.extKeyUsage.join(', ')
      } else {
        value = ext.value || 'N/A'
      }
    } catch {
      value = 'Unable to parse'
    }
    
    result.push({
      name,
      value,
      critical: ext.critical || false
    })
  }
  
  return result
}

/**
 * 获取扩展名称
 * @param oid 对象标识符
 * @returns 扩展名称
 */
function getExtensionName(oid: string): string {
  const extensionNames: Record<string, string> = {
    '2.5.29.14': 'Subject Key Identifier',
    '2.5.29.15': 'Key Usage',
    '2.5.29.17': 'Subject Alternative Name',
    '2.5.29.19': 'Basic Constraints',
    '2.5.29.31': 'CRL Distribution Points',
    '2.5.29.32': 'Certificate Policies',
    '2.5.29.35': 'Authority Key Identifier',
    '2.5.29.37': 'Extended Key Usage',
    '1.3.6.1.5.5.7.1.1': 'Authority Information Access',
    '1.3.6.1.4.1.11129.2.4.2': 'Certificate Transparency'
  }
  
  return extensionNames[oid] || `Unknown Extension (${oid})`
}

/**
 * 分析证书安全性
 * @param cert 证书信息
 * @returns 安全性分析结果
 */
function analyzeCertificateSecurity(cert: CertificateInfo): {
  errors: string[]
  warnings: string[]
  recommendations: string[]
  securityLevel: 'high' | 'medium' | 'low' | 'critical'
} {
  const errors: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  let securityLevel: 'high' | 'medium' | 'low' | 'critical' = 'high'
  
  // 检查证书有效期
  if (cert.validity.isExpired) {
    errors.push('证书已过期')
    securityLevel = 'critical'
  } else if (cert.validity.daysUntilExpiry <= 30) {
    warnings.push(`证书将在${cert.validity.daysUntilExpiry}天后过期`)
    if (securityLevel === 'high') securityLevel = 'medium'
  }
  
  // 检查公钥强度
  if (cert.publicKey.algorithm === 'RSA') {
    if (cert.publicKey.size < 2048) {
      errors.push(`RSA密钥长度过短: ${cert.publicKey.size}位`)
      securityLevel = 'critical'
    } else if (cert.publicKey.size < 3072) {
      warnings.push(`RSA密钥长度较短: ${cert.publicKey.size}位，建议使用3072位或更长`)
      if (securityLevel === 'high') securityLevel = 'medium'
    }
  }
  
  // 检查签名算法
  const weakSignatureAlgorithms = ['md5', 'sha1']
  const sigAlg = cert.signatureAlgorithm.toLowerCase()
  if (weakSignatureAlgorithms.some(weak => sigAlg.includes(weak))) {
    errors.push(`使用了弱签名算法: ${cert.signatureAlgorithm}`)
    securityLevel = 'critical'
  }
  
  // 检查证书版本
  if (cert.version < 3) {
    warnings.push(`证书版本较旧: v${cert.version}，建议使用v3`)
    if (securityLevel === 'high') securityLevel = 'medium'
  }
  
  // 检查关键扩展
  const hasBasicConstraints = cert.extensions.some(ext => ext.name.includes('Basic Constraints'))
  const hasKeyUsage = cert.extensions.some(ext => ext.name.includes('Key Usage'))
  const hasSubjectAltName = cert.extensions.some(ext => ext.name.includes('Subject Alternative Name'))
  
  if (!hasBasicConstraints) {
    warnings.push('缺少基本约束扩展')
  }
  if (!hasKeyUsage) {
    warnings.push('缺少密钥用法扩展')
  }
  if (!hasSubjectAltName) {
    recommendations.push('建议添加主体备用名称扩展')
  }
  
  // 生成建议
  if (cert.validity.daysUntilExpiry <= 90) {
    recommendations.push('建议及时更新证书')
  }
  
  if (cert.publicKey.algorithm === 'RSA' && cert.publicKey.size < 4096) {
    recommendations.push('考虑使用4096位RSA密钥或ECC算法')
  }
  
  recommendations.push('定期检查证书有效性和安全性')
  recommendations.push('使用证书透明度日志监控证书颁发')
  
  return {
    errors,
    warnings,
    recommendations,
    securityLevel
  }
}

/**
 * 验证证书链
 * @param certificates 证书数组（从叶子证书到根证书）
 * @returns 验证结果
 */
export function validateCertificateChain(certificates: string[]): {
  isValid: boolean
  chainLength: number
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    if (certificates.length === 0) {
      errors.push('证书链为空')
      return { isValid: false, chainLength: 0, errors, warnings }
    }
    
    const certs = certificates.map(pem => {
      try {
        return forge.pki.certificateFromPem(pem)
      } catch (error) {
        throw new Error(`无效的证书格式: ${formatError(error)}`)
      }
    })
    
    // 验证证书链的连续性
    for (let i = 0; i < certs.length - 1; i++) {
      const cert = certs[i]
      const issuerCert = certs[i + 1]
      
      try {
        // 验证签名
        const verified = issuerCert.verify(cert)
        if (!verified) {
          errors.push(`证书${i}的签名验证失败`)
        }
      } catch (error) {
        errors.push(`证书${i}签名验证出错: ${formatError(error)}`)
      }
      
      // 检查颁发者和主体匹配
      const issuerDN = cert.issuer.attributes.map((attr: any) => `${attr.shortName}=${attr.value}`).join(', ')
      const subjectDN = issuerCert.subject.attributes.map((attr: any) => `${attr.shortName}=${attr.value}`).join(', ')
      
      if (issuerDN !== subjectDN) {
        warnings.push(`证书${i}的颁发者与证书${i + 1}的主体不匹配`)
      }
    }
    
    // 检查根证书是否自签名
    const rootCert = certs[certs.length - 1]
    const rootIssuerDN = rootCert.issuer.attributes.map((attr: any) => `${attr.shortName}=${attr.value}`).join(', ')
    const rootSubjectDN = rootCert.subject.attributes.map((attr: any) => `${attr.shortName}=${attr.value}`).join(', ')
    
    if (rootIssuerDN !== rootSubjectDN) {
      warnings.push('根证书不是自签名证书')
    }
    
    return {
      isValid: errors.length === 0,
      chainLength: certificates.length,
      errors,
      warnings
    }
  } catch (error) {
    errors.push(`证书链验证失败: ${formatError(error)}`)
    return {
      isValid: false,
      chainLength: certificates.length,
      errors,
      warnings
    }
  }
}

/**
 * 生成证书摘要信息
 * @param cert 证书信息
 * @returns 摘要信息
 */
export function generateCertificateSummary(cert: CertificateInfo): {
  title: string
  subtitle: string
  status: 'valid' | 'warning' | 'error'
  details: Array<{ label: string; value: string; type?: 'success' | 'warning' | 'error' }>
} {
  const details = [
    { label: '通用名称', value: cert.subject.commonName || 'N/A' },
    { label: '颁发者', value: cert.issuer.commonName || 'N/A' },
    { label: '有效期', value: `${cert.validity.notBefore.toLocaleDateString()} - ${cert.validity.notAfter.toLocaleDateString()}` },
    { label: '剩余天数', value: `${cert.validity.daysUntilExpiry}天`, type: cert.validity.daysUntilExpiry <= 30 ? 'warning' as const : 'success' as const },
    { label: '公钥算法', value: `${cert.publicKey.algorithm} ${cert.publicKey.size}位` },
    { label: '签名算法', value: cert.signatureAlgorithm },
    { label: 'SHA256指纹', value: cert.fingerprints.sha256 }
  ]
  
  let status: 'valid' | 'warning' | 'error' = 'valid'
  if (cert.validity.isExpired) {
    status = 'error'
  } else if (cert.validity.daysUntilExpiry <= 30 || cert.publicKey.size < 2048) {
    status = 'warning'
  }
  
  return {
    title: cert.subject.commonName || '未知证书',
    subtitle: `由 ${cert.issuer.commonName || '未知CA'} 颁发`,
    status,
    details
  }
}

/**
 * 导出证书信息为JSON
 * @param cert 证书信息
 * @returns JSON字符串
 */
export function exportCertificateInfo(cert: CertificateInfo): string {
  return JSON.stringify(cert, null, 2)
}

/**
 * 比较两个证书
 * @param cert1 证书1
 * @param cert2 证书2
 * @returns 比较结果
 */
export function compareCertificates(cert1: CertificateInfo, cert2: CertificateInfo): {
  identical: boolean
  differences: Array<{
    field: string
    cert1Value: string
    cert2Value: string
  }>
} {
  const differences: Array<{
    field: string
    cert1Value: string
    cert2Value: string
  }> = []
  
  // 比较基本字段
  const fieldsToCompare = [
    { field: '序列号', getValue: (cert: CertificateInfo) => cert.serialNumber },
    { field: '通用名称', getValue: (cert: CertificateInfo) => cert.subject.commonName },
    { field: '颁发者', getValue: (cert: CertificateInfo) => cert.issuer.commonName },
    { field: '有效期开始', getValue: (cert: CertificateInfo) => cert.validity.notBefore.toISOString() },
    { field: '有效期结束', getValue: (cert: CertificateInfo) => cert.validity.notAfter.toISOString() },
    { field: '公钥算法', getValue: (cert: CertificateInfo) => cert.publicKey.algorithm },
    { field: '公钥大小', getValue: (cert: CertificateInfo) => cert.publicKey.size.toString() },
    { field: '签名算法', getValue: (cert: CertificateInfo) => cert.signatureAlgorithm },
    { field: 'SHA256指纹', getValue: (cert: CertificateInfo) => cert.fingerprints.sha256 }
  ]
  
  for (const { field, getValue } of fieldsToCompare) {
    const value1 = getValue(cert1)
    const value2 = getValue(cert2)
    
    if (value1 !== value2) {
      differences.push({
        field,
        cert1Value: value1,
        cert2Value: value2
      })
    }
  }
  
  return {
    identical: differences.length === 0,
    differences
  }
}

/**
 * 获取证书安全等级颜色
 * @param level 安全等级
 * @returns 颜色代码
 */
export function getSecurityLevelColor(level: 'high' | 'medium' | 'low' | 'critical'): string {
  const colors = {
    high: '#67C23A',     // 绿色
    medium: '#E6A23C',   // 橙色
    low: '#F56C6C',      // 红色
    critical: '#F56C6C'  // 深红色
  }
  
  return colors[level]
}

/**
 * 获取证书安全等级文本
 * @param level 安全等级
 * @returns 等级文本
 */
export function getSecurityLevelText(level: 'high' | 'medium' | 'low' | 'critical'): string {
  const texts = {
    high: '高',
    medium: '中',
    low: '低',
    critical: '严重'
  }
  
  return texts[level]
}