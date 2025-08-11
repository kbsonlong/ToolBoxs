// 修复 Element Plus Icons 类型定义问题
declare module '@element-plus/icons-vue' {
  import { DefineComponent } from 'vue'
  
  // 导出所有图标组件
  export const Plus: DefineComponent
  export const RefreshRight: DefineComponent
  export const WarningFilled: DefineComponent
  export const Hide: DefineComponent
  export const Grid: DefineComponent
  export const Key: DefineComponent
  export const DocumentAdd: DefineComponent
  export const Operation: DefineComponent
  export const Switch: DefineComponent
  export const Star: DefineComponent
  export const Fold: DefineComponent
  export const TrendCharts: DefineComponent
  export const House: DefineComponent
  export const Tools: DefineComponent
  export const Trophy: DefineComponent
  export const Medal: DefineComponent
  export const InfoFilled: DefineComponent
  export const Menu: DefineComponent
  export const ArrowLeft: DefineComponent
  export const ArrowRight: DefineComponent
}