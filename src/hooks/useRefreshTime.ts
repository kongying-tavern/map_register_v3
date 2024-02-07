import { useDadianStore } from '@/stores'
import { plainTimeFormatter } from '@/utils'

export const useRefreshTime = (refreshTime: Ref<number | undefined>) => {
  const dadianStore = useDadianStore()

  const refreshTimeOptions = computed(() => {
    const { refreshTimeSpecial = [] } = dadianStore._raw.editor ?? {}
    return [
      { label: '不刷新', value: 0 },
      { label: '自定义', value: 12 * 3600 * 1000 },
      ...refreshTimeSpecial,
    ]
  })

  const refreshTimeTypeOptions = computed(() => refreshTimeOptions.value.map(({ label }) => ({ label, value: label })))

  const refreshTimeTypeNameMap = computed(() => Object.fromEntries(refreshTimeOptions.value.map(({ label, value }) => [value, label])))

  const refreshTimeTypeMap = computed(() => Object.fromEntries(refreshTimeOptions.value.map(({ label, value }) => [label, value])))

  const refreshTimeType = computed({
    get: () => {
      if (!refreshTime.value)
        return '不刷新'
      if (refreshTime.value < 0)
        return refreshTimeTypeNameMap.value[refreshTime.value]
      return plainTimeFormatter(refreshTime.value)
    },
    set: (v) => {
      refreshTime.value = refreshTimeTypeMap.value[v]
    },
  })

  const isCustom = computed(() => refreshTimeType.value === '自定义')

  return { refreshTimeOptions, refreshTimeTypeOptions, refreshTimeTypeNameMap, refreshTimeTypeMap, refreshTimeType, isCustom }
}
