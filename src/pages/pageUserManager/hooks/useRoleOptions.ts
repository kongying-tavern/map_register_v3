import { getRoleList } from '@/api/system/role'
import { RoleData } from '@/api/system/user'
import { ref } from 'vue'

export const useRoleOptions = async () => {
  return getRoleList().then((res) => {
    return res.data
  })
}
