import { getToken, request } from '@/utils'

export type UserSearchFilter = {
  current: number
  size: number
  nickname?: string
  sort?: string[]
  username?: string
}
export interface UserProfile {
  username?: string
  nickname?: string
  qq?: string
  phone?: string
}
export interface UserData extends UserProfile {
  id: number
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
    url: 'system/user/info/userList',
    method: 'post',
    data: data,
  })
}
