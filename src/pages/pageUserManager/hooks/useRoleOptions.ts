import { getRoleList } from '@/api/system/role'
import { computed, ref } from 'vue'
import type { RoleData } from '@/api/system/user'

interface RoleHookOptions {
  immediate?: boolean
}

export const useRoleOptions = (options: RoleHookOptions = {}) => {
  const { immediate = true } = options

  const unsortedRoles = ref<RoleData[]>([])
  const roleOptions = computed(() =>
    unsortedRoles.value.sort((a, b) => a.sort - b.sort),
  )
  const loading = ref(false)

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

  return { roleOptions, loading, refresh }
}
