import 'alova'

declare module 'alova' {
  export interface AlovaCustomTypes {
    meta?: {
      /**
       * 是否不进行数据解析，当指定为 `raw: true` 时，
       * 将返回原始 Response 对象（使用 fetch 适配器时有效）
       */
      raw?: boolean
    }
  }
}
