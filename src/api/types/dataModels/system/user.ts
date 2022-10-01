import type { Role } from '.'

/** 用户 */
export interface User {
  /**
   * 昵称
   */
  nickname: string
  /**
   * 密码
   */
  password: string
  /**
   * 手机号
   */
  phone: string
  /**
   * QQ
   */
  qq: string
  /**
   * 角色列表
   */
  roleLIst: Role[]
  /**
   * 用户ID
   */
  userId: number
  /**
   * 用户名
   */
  username: string
}
