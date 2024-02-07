import type { ShallowRef } from 'vue'
import type { MarkerExtra } from '@/utils'
import { HIDDEN_FLAG_NAM_MAP } from '@/shared'
import { useRefreshTime } from '@/hooks'

export const useMarkerExtra = (markerInfo: ShallowRef<API.MarkerVo | null>) => {
  const extraObject = computed(() => (markerInfo.value?.extra ?? {}) as MarkerExtra)

  const isUnderground = computed(() => extraObject.value.underground?.is_underground ?? false)

  const hiddenFlagType = computed(() => HIDDEN_FLAG_NAM_MAP[markerInfo.value?.hiddenFlag ?? ''])

  const { refreshTimeType } = useRefreshTime(computed(() => markerInfo.value?.refreshTime))

  return { isUnderground, hiddenFlagType, refreshTimeType }
}
