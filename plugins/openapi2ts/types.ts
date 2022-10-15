import { GenerateServiceProps } from 'openapi2ts'

export interface Openapi2tsOptions extends GenerateServiceProps {
  /** openAPI 3.0 的地址 */
  schemaPath: string
  /** 自定义请求方法路径 */
  requestLibPath?: string
  /** 自定义请求方法表达式，优先级高于 `requestLibPath` */
  requestImportStatement?: string
}
