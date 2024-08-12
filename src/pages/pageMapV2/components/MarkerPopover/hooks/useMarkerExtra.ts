import type { ShallowRef } from 'vue'
import { HIDDEN_FLAG_NAME_MAP } from '@/shared'
import { useRefreshTime } from '@/hooks'

export const useMarkerExtra = (markerInfo: ShallowRef<API.MarkerVo | null>) => {
  const extraObject = computed(() => (markerInfo.value?.extra ?? {}) as API.MarkerExtra)

  const isUnderground = computed(() => extraObject.value.underground?.is_underground ?? false)

  const hiddenFlagType = computed(() => HIDDEN_FLAG_NAME_MAP[markerInfo.value?.hiddenFlag ?? ''])

  const { humanFriendlyTimeText: refreshTimeText } = useRefreshTime(computed(() => markerInfo.value?.refreshTime), {
    toHumanFriendly: (days, hours, minutes) => {
      if (days + hours + minutes <= 0)
        return '不刷新'
      const dayText = days > 0 ? `${days} 天` : ''
      const hourText = hours > 0 ? `${hours} 小时` : ''
      const minuteText = minutes > 0 ? `${minutes} 分钟` : ''
      return `刷新时间：${dayText + hourText + minuteText}`
    },
  })

  return { isUnderground, hiddenFlagType, refreshTimeText }
}
