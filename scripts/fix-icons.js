#!/usr/bin/env node

// 修复 Element Plus 图标导入错误的脚本
const fs = require('fs')
const path = require('path')

// 图标名称映射表（错误名称 -> 正确名称）
// 注意：这些都是实际存在的图标名称，不需要映射
const correctIcons = [
  'Switch', 'Star', 'DocumentAdd', 'Operation', 'Hide', 'Warning', 
  'Refresh', 'Plus', 'Grid', 'WarningFilled', 'RefreshRight'
]

// 实际不存在的图标名称映射
const iconMapping = {
  // 这些映射已经不需要了，因为原始名称都是正确的
}

// 需要修复的文件列表
const filesToFix = [
  'src/views/tools/JSONView.vue',
  'src/views/tools/Base64View.vue',
  'src/views/tools/MD5View.vue',
  'src/views/tools/PasswordView.vue',
  'src/views/tools/QRCodeView.vue',
  'src/components/AppNavigation.vue',
  'src/views/HomeView.vue',
  'src/views/NotFoundView.vue'
]

function fixIconsInFile(filePath) {
  const fullPath = path.join(__dirname, '..', 'app', filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`文件不存在: ${filePath}`)
    return
  }
  
  let content = fs.readFileSync(fullPath, 'utf8')
  let modified = false
  
  // 修复导入语句中的图标名称
  Object.entries(iconMapping).forEach(([oldName, newName]) => {
    const importRegex = new RegExp(`(import\s*{[^}]*?)\b${oldName}\b([^}]*?})`, 'g')
    if (content.match(importRegex)) {
      content = content.replace(importRegex, `$1${newName}$2`)
      modified = true
      console.log(`${filePath}: 修复导入 ${oldName} -> ${newName}`)
    }
    
    // 修复模板中的图标使用
    const templateRegex = new RegExp(`:icon="${oldName}"`, 'g')
    if (content.match(templateRegex)) {
      content = content.replace(templateRegex, `:icon="${newName}"`)
      modified = true
      console.log(`${filePath}: 修复模板使用 ${oldName} -> ${newName}`)
    }
    
    // 修复组件标签中的图标
    const componentRegex = new RegExp(`<${oldName}\s*/>`, 'g')
    if (content.match(componentRegex)) {
      content = content.replace(componentRegex, `<${newName} />`)
      modified = true
      console.log(`${filePath}: 修复组件标签 ${oldName} -> ${newName}`)
    }
  })
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✅ 已修复: ${filePath}`)
  } else {
    console.log(`⏭️  无需修复: ${filePath}`)
  }
}

console.log('🔧 开始修复 Element Plus 图标导入错误...')
console.log('=')

filesToFix.forEach(fixIconsInFile)

console.log('\n🎉 图标修复完成！')
console.log('\n💡 提示: 请运行 npm run type-check 验证修复结果')