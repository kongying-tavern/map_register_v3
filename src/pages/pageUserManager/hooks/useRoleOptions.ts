import { getRoleList } from '@/api/system/role'
import { computed, ref } from 'vue'
import type { RoleData } from '@/api/system/user'

interface RoleHookOptions {
  immediate?: boolean
}

export const useRoleOptions = (options: RoleHookOptions = {}) => {
  const { immediate = true } = options

  const loading = ref(false)
  const unsortedRoles = ref<RoleData[]>([])

  const rolesSort = (a: RoleData, b: RoleData) => a.sort - b.sort

  const roleOptions = computed(() => unsortedRoles.value.sort(rolesSort))

  const refresh = async () => {
    loading.value = true
    try {
      const res = await getRoleList()
      unsortedRoles.value = res.data
    } catch {
      unsortedRoles.value = []
    } finally {
      loading.value = false
    }
  }

  immediate && refresh()

  return { roleOptions, loading, refresh, rolesSort }
}
