import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useRoleList = () => {
  const roleList = ref<API.SysRoleVo[]>([])

  const { onSuccess } = useFetchHook({
    immediate: true,
    onRequest: () => Api.role.listRole(),
  })

  onSuccess(({ data = [] }) => {
    roleList.value = data.sort(({ sort: sortA = 0 }: API.SysRoleVo, { sort: sortB = 0 }: API.SysRoleVo) => sortA - sortB)
  })

  return { roleList }
}
