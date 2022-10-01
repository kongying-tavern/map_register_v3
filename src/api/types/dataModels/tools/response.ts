/** 响应信息 */
export interface Response<T = any> {
  /**
   * 返回标记，成功标记=0，失败标记=1
   */
  code: number
  /**
   * 返回信息
   */
  message: string
  /**
   * 响应时间
   */
  time: string
  /**
   * 数据本体
   */
  data: T
}
