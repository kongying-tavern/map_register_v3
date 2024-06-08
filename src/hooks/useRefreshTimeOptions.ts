import { computed } from 'vue'
import { useDadianStore } from '@/stores'

export const useRefreshTimeOptions = () => {
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

  return {
    refreshTimeOptions,
    refreshTimeTypeOptions,
    refreshTimeTypeNameMap,
    refreshTimeTypeMap,
  }
}
