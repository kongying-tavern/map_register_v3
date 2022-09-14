import { request } from '@/utils'
export type UserSearchFilter = {
  current: number
  size: number
  nickname?: string
  sort?: string[]
  username?: string
}
export interface UserProfile {
  username?: string
  nickName?: string
  qq?: string
  phone?: string
}
export interface UserData extends UserProfile {
  userId: number
  roleList: {
    items: RoleData[]
  }
}
export type RoleData = {
  id: number
  name: string
  code: string
  sort: number
}
export function fetch_user_list(data: UserSearchFilter) {
  return request({
    url: '/user/info/userList',
    method: 'post',
    data: data,
  })
}
