import { computed, ref } from 'vue'
import System from '@/api/system'

interface RoleHookOptions {
  immediate?: boolean
  publicMode?: boolean
  publicUpdateDebounce?: number
}

const rolesSort = (
  { sort: sortA = 0 }: API.SysRoleVo,
  { sort: sortB = 0 }: API.SysRoleVo,
) => sortA - sortB
const publicRoleList = ref<API.SysRoleVo[]>([])
const lastUpdateTime = ref<number | undefined>()
const publicSortedRoles = computed(() => publicRoleList.value.sort(rolesSort))
const selectOptions = computed(() => publicSortedRoles.value.map(item => ({
  label: item.name,
  value: item.id,
})))

export const useRoleOptions = (options: RoleHookOptions = {}) => {
  const { immediate = true, publicMode = false, publicUpdateDebounce = 1000 } = options

  const loading = ref(false)
  const unsortedRoles = ref<API.SysRoleVo[]>([])

  const sortedRoles = computed(() => {
    return publicMode ? publicSortedRoles.value : unsortedRoles.value.sort(rolesSort)
  })

  const roleOptions = computed(() => {
    return sortedRoles.value
  })

  const refresh = async () => {
    if (publicMode) {
      const now = new Date().getTime()
      if (lastUpdateTime.value && now - lastUpdateTime.value <= publicUpdateDebounce)
        return
      lastUpdateTime.value = now
    }
    loading.value = true
    try {
      const { data = [] } = await System.role.listRole()
      unsortedRoles.value = data
      publicRoleList.value = data
    }
    catch {
      unsortedRoles.value = []
    }
    finally {
      loading.value = false
    }
  }

  immediate && refresh()

  return { roleOptions, selectOptions, loading, refresh, rolesSort }
}
