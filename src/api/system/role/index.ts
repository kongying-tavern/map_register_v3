import { request } from '@/utils'

export const getRoleList = () => {
  return request({
    url: 'system/role/list',
    method: 'get',
  })
}
