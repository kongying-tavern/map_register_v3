import { request } from '@/utils'

export type UserSearchFilter = {
  current: number
  size: number
  nickname?: string
  sort?: string[]
  username?: string
}
export interface UserData {
  id: number
  username?: string
  nickname?: string
  qq?: string
  phone?: string
  roleList?: RoleData[]
}
export type RoleData = {
  id: number
  name: string
  code: string
  sort: number
}
export function fetchUserList(data: UserSearchFilter) {
  return request({
    url: 'system/user/info/userList',
    method: 'post',
    data: data,
  })
}
export function deleteUser(userid: number) {
  return request({
    url: `system/user/${userid}`,
    method: 'delete',
  })
}
export function updateUser(data: UserData) {
  return request({
    url: 'system/user/update',
    method: 'post',
    data: {
      userId: data.id,
      nickname: data.nickname,
      username: data.username,
      qq: data.qq,
      phone: data.phone,
    },
  })
}

export function createUser(data: { username: string; password: string }) {
  return request({
    url: 'system/user/register',
    method: 'post',
    data: data,
  })
}
