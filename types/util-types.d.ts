export {}

/** 工具类型 */
declare global {
  /** 递归类型使其所有键值均为必填 */
  type DeepRequired<T> = {
    [P in keyof T]-?: DeepRequired<T[P]>
  }

  /** 提取数组项 */
  type Item<T extends unknown[]> = T[number]
}
