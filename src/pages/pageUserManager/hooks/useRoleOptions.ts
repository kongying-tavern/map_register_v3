import { computed, ref } from 'vue'
import System from '@/api/system'

interface RoleHookOptions {
  /** 是否在组件加载后立即更新 */
  immediate?: boolean
  /** 公共模式，将会使用公共值，降低请求数 */
  publicMode?: boolean
  /** 公共缓存更新时间 */
  publicUpdateDebounce?: number
}

/** 排序函数 */
const rolesSort = ({ sort: sortA = 0 }: API.SysRoleVo, { sort: sortB = 0 }: API.SysRoleVo) => sortA - sortB

/** 上次更新时间 */
const lastUpdateTime = ref<number | undefined>()
/** 公共角色列表 */
const publicRoleList = ref<API.SysRoleVo[]>([])
/** 公共角色列表（已排序） */
const publicSortedRoles = computed(() => publicRoleList.value.sort(rolesSort))
/** 提供给 el-select 的格式化选项列表 */
const selectOptions = computed(() => publicSortedRoles.value.map(item => ({
  label: item.name ?? '',
  value: item.id ?? -1,
})))
/** 从值到选项的逆映射表，用于减少 find 消耗 */
const roleValueMap = computed<Record<number, API.SysRoleVo>>(() => Object.fromEntries(publicSortedRoles.value.map((role) => {
  return [role.id, role]
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

  return { roleOptions, selectOptions, roleValueMap, loading, refresh, rolesSort }
}
