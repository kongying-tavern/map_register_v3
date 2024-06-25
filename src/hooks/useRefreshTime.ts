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

  const humanFriendlyTimeText = computed(() => {
    if (!isCustom.value)
      return ''
    const time = Number(refreshTime.value) || 0
    const days = Math.floor(time / 86400000)
    const hours = Math.floor((time % 86400000) / 3600000)
    const minutes = Math.floor((time % 3600000) / 60000)
    return `${days} 天 ${hours} 小时 ${minutes} 分钟`
  })

  return {
    refreshTimeOptions,
    refreshTimeTypeOptions,
    refreshTimeTypeNameMap,
    refreshTimeTypeMap,
    refreshTimeType,
    isCustom,
    humanFriendlyTimeText,
  }
}
