/** 角色 */
export interface Role {
  /**
   * 角色代码（英文大写）
   */
  code: string
  /**
   * 角色ID
   */
  id: number
  /**
   * 角色名
   */
  name: string
  /**
   * 角色层级（越大级别越高）
   */
  sort: number
}
