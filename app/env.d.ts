/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

// 确保Vue相关模块的类型声明
declare module 'vue' {
  export * from '@vue/runtime-dom'
}

declare module 'vue-router' {
  export * from 'vue-router/dist/vue-router'
}

declare module 'element-plus' {
  export * from 'element-plus/es'
}

declare module '@element-plus/icons-vue' {
  const Lock: any
  const UploadFilled: any
  const DocumentCopy: any
  const Download: any
  const Document: any
  const Delete: any
  const Check: any
  const View: any
  const Clock: any
  export { Lock, UploadFilled, DocumentCopy, Download, Document, Delete, Check, View, Clock }
}