import { computed, ref } from 'vue'
import System from '@/api/system'

interface RoleHookOptions {
  immediate?: boolean
}

export const useRoleOptions = (options: RoleHookOptions = {}) => {
  const { immediate = true } = options

  const loading = ref(false)
  const unsortedRoles = ref<API.SysRoleVo[]>([])

  const rolesSort = (
    { sort: sortA = 0 }: API.SysRoleVo,
    { sort: sortB = 0 }: API.SysRoleVo,
  ) => sortA - sortB

  const roleOptions = computed(() => unsortedRoles.value.sort(rolesSort))

  const refresh = async () => {
    loading.value = true
    try {
      const res = await System.role.listRole()
      unsortedRoles.value = res.data ?? []
    }
    catch {
      unsortedRoles.value = []
    }
    finally {
      loading.value = false
    }
  }

  immediate && refresh()

  return { roleOptions, loading, refresh, rolesSort }
}
