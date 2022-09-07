/** 为单文件组件提供类型声明 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

/** 拓展 ENV 环境变量对象的类型 */
interface ImportMetaEnv {
  /** 标题 */
  readonly VITE_TITLE: string

  /**
   * 接口地址
   * @default https://cloud.yuanshen.site
   */
  readonly VITE_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
