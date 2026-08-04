import type { FilterType } from '@/stores/types'
import { useMapStateStore } from '@/stores'

/** 获取当前使用的过滤条件（与当前过滤器状态一致） */
export const useCurrentPreset = () => {
  const mapStateStore = useMapStateStore()

  const filterType = computed<FilterType>(() => mapStateStore.markerFilterType)
  const conditions = computed(() => mapStateStore.markerFilters)

  return {
    filterType,
    conditions,
  }
}
