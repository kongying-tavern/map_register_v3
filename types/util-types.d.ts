export {}

/** 工具类型 */
declare global {
  /** 递归类型使其所有键值均为必填 */
  type DeepRequired<T> = {
    [P in keyof T]-?: DeepRequired<T[P]>
  }

  /** 提取数组项 */
  type Item<T extends unknown[]> = T[number]

  /** 下划线风格转换为小驼峰风格 */
  type SnakeCaseToCamelCase<S extends string> =
  S extends `${infer Prefix}_${infer Rest}`
    ? `${SnakeCaseToCamelCase<Prefix>}${Capitalize<SnakeCaseToCamelCase<Rest>>}`
    : S

  /** 转换对象的所有下划线风格 key 为小驼峰风格的 key */
  type SnakeCaseKeysToCamelCase<T> = {
    [K in keyof T as SnakeCaseToCamelCase<K>]: T[K];
  }
}
