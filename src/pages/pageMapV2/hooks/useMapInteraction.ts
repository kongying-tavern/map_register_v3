import { useMap } from '.'
import { useMapStore } from '@/stores'
import { isMarkerVo } from '@/utils'

export const useMapInteraction = () => {
  const mapStore = useMapStore()

  const { map } = useMap()

  watch(() => isMarkerVo(mapStore.hover) ? mapStore.hover : null, (markerInfo) => {
    map.value?.baseLayer?.setState({
      hover: markerInfo,
    })
  })

  return {}
}
