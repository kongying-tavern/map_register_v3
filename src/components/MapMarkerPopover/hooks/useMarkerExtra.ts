import type { ShallowRef } from 'vue'
import { useRefreshTime } from '@/hooks'
import { HIDDEN_FLAG_NAME_MAP } from '@/shared'

export const useMarkerExtra = (markerInfo: ShallowRef<API.MarkerVo | null>) => {
  const extraObject = computed(() => (markerInfo.value?.extra ?? {}) as API.MarkerExtra)

  const isUnderground = computed(() => extraObject.value.underground?.is_underground ?? false)

  const hiddenFlagType = computed(() => HIDDEN_FLAG_NAME_MAP[markerInfo.value?.hiddenFlag ?? ''])

  const { humanFriendlyTimeText: refreshTimeText } = useRefreshTime(computed(() => markerInfo.value?.refreshTime), {
    toHumanFriendly: (days, hours, minutes) => {
      const dayText = days > 0 ? `${days} 天` : ''
      const hourText = hours > 0 ? `${hours} 小时` : ''
      const minuteText = minutes > 0 ? `${minutes} 分钟` : ''
      return `${dayText + hourText + minuteText}`
    },
  })

  return { isUnderground, hiddenFlagType, refreshTimeText }
}
