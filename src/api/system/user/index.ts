import { request } from '@/utils'
import type { UserData } from './fetchUserList'
export * from './fetchUserList'

export type UserSearchFilter = {
  current: number
  size: number
  nickname?: string
  sort?: string[]
  username?: string
}
export type RoleData = {
  id: number
  name: string
  code: string
  sort: number
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

export function createQQUser(data: { username: string; password: string }) {
  return request({
    url: 'system/user/register/qq',
    method: 'post',
    data: data,
  })
}

export function changeUserPassword(data: {
  userId: number
  password: string
  oldPassword: string
}) {
  return request({
    url: 'system/user/update_password',
    method: 'post',
    data,
  })
}
