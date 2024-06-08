import { useRefreshTimeOptions } from '.'

export const useRefreshTime = (refreshTime: Ref<number | undefined>) => {
  const { refreshTimeOptions, refreshTimeTypeOptions, refreshTimeTypeNameMap, refreshTimeTypeMap } = useRefreshTimeOptions()

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

  const isCustom = computed(() => refreshTime.value !== undefined && refreshTime.value > 0)

  return {
    refreshTimeOptions,
    refreshTimeTypeOptions,
    refreshTimeTypeNameMap,
    refreshTimeTypeMap,
    refreshTimeType,
    isCustom,
  }
}
