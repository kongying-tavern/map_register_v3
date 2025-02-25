import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export const useRoleList = () => {
  const roleList = ref<API.SysRoleVo[]>([])

  const roleMap = computed(() => roleList.value.reduce((map, role) => {
    map.set(role.id!, role)
    return map
  }, new Map<number, API.SysRoleVo>()))

  const { onSuccess } = useFetchHook({
    immediate: true,
    onRequest: () => Api.role.listRole(),
  })

  onSuccess(({ data = [] }) => {
    roleList.value = data.sort(({ sort: sortA = 0 }: API.SysRoleVo, { sort: sortB = 0 }: API.SysRoleVo) => sortA - sortB)
  })

  return { roleList, roleMap }
}
