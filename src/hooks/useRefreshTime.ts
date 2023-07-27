import { useFetchHook } from '@/hooks'
import Config from '@/api/config'

export const useRefreshTime = (refreshTime: Ref<number | undefined>) => {
  const refreshTimeSpecialOptions = shallowRef<{ label: string; value: number }[]>([])

  const { onSuccess } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      const { editor: { refreshTimeSpecial = [] } = {} } = await Config.getDadianConfig()
      return refreshTimeSpecial
    },
  })

  onSuccess((refreshTimeOptions) => {
    refreshTimeSpecialOptions.value = refreshTimeOptions
  })

  const refreshTimeOptions = computed(() => [
    { label: '不刷新', value: 0 },
    { label: '自定义', value: 12 * 3600 * 1000 },
    ...refreshTimeSpecialOptions.value,
  ])

  const refreshTimeTypeOptions = computed(() => refreshTimeOptions.value.map(({ label }) => ({ label, value: label })))

  const refreshTimeTypeNameMap = computed(() => Object.fromEntries(refreshTimeOptions.value.map(({ label, value }) => [value, label])))

  const refreshTimeTypeMap = computed(() => Object.fromEntries(refreshTimeOptions.value.map(({ label, value }) => [label, value])))

  const refreshTimeType = computed({
    get: () => {
      if (!refreshTime.value)
        return '不刷新'
      if (refreshTime.value < 0)
        return refreshTimeTypeNameMap.value[refreshTime.value]
      return '自定义'
    },
    set: (v) => {
      refreshTime.value = refreshTimeTypeMap.value[v]
    },
  })

  const isCustom = computed(() => refreshTimeType.value === '自定义')

  return { refreshTimeSpecialOptions, refreshTimeOptions, refreshTimeTypeOptions, refreshTimeTypeNameMap, refreshTimeTypeMap, refreshTimeType, isCustom }
}
