export {}

/** 工具类型 */
declare global {
  /** 递归类型使其所有键值均为必填 */
  type DeepRequired<T> = {
    [P in keyof T]-?: DeepRequired<T[P]>
  }
}
