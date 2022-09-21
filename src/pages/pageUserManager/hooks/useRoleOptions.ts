import { getRoleList } from '@/api/system/role'

export const useRoleOptions = async () => {
  return getRoleList().then((res) => {
    return res
  })
}
