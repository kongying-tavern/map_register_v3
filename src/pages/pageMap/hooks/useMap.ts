import L from 'leaflet'
import type { Ref, ShallowRef } from 'vue'
import { GenshinMap } from '../utils'

export const useMap = (ele: Ref<HTMLElement | null>) => {
  const map = shallowRef(null) as ShallowRef<GenshinMap | null>

  onMounted(() => {
    if (!ele.value)
      return
    const newMap = new GenshinMap(ele.value, {
      center: [0, 0],
      zoom: -4,
      maxZoom: 2,
      minZoom: -4,
      maxBounds: L.latLngBounds(
        L.latLng(-10000, -10000),
        L.latLng(10000, 10000),
      ),
      tap: false,
      attributionControl: false,
      zoomControl: false,
    })
    map.value = newMap
  })

  return { map }
}
