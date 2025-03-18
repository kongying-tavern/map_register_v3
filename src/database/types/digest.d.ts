declare namespace DBType {
  type DigestRange<T> = [lower: T, upper: T]

  /** 摘要的实体结构 */
  interface DigestInfo {
    /** 摘要的值 */
    code: string

    /** 当前摘要控制的表名 */
    tableName: string

    /** 当前摘要在对应表下的序号 */
    index?: number

    /** 当前摘要控制的表的 key 的范围 */
    range: DigestRange<string> | DigestRange<number>
  }
}
