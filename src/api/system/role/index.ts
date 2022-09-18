import { request } from '@/utils'

export const getRoleList = () => {
  return request({
    url: 'system/role/list',
    method: 'get',
  })
}
export const assignUserRole = (userId: number, roleId: number) => {
  return request({
    url: 'system/role/user',
    method: 'put',
    data: {
      userId,
      roleId,
    },
  })
}

export const removeUserRole = (userId: number, roleId: number) => {
  return request({
    url: 'system/role/user',
    method: 'delete',
    data: {
      userId,
      roleId,
    },
  })
}
