import type { Ref } from 'vue'
import { GenshinMap } from '../utils'

export const useMap = (ele: Ref<HTMLElement | null>) => {
  const map = ref<GenshinMap | null>(null) as Ref<GenshinMap | null>
  const hookUnregisters = shallowRef<(() => void)[]>([])
  const mapCreatedHook = createEventHook<GenshinMap>()

  const onMapCreated = (cb: (mapInstance: GenshinMap) => void) => {
    const { off } = mapCreatedHook.on(cb)
    hookUnregisters.value.push(off)
    return off
  }

  onMounted(() => {
    if (!ele.value)
      return
    const newMap = new GenshinMap(ele.value, {
      center: [0, 0],
      zoom: -4,
      maxZoom: 2,
      minZoom: -4,
      tap: false,
      zoomAnimation: false,
      attributionControl: false,
      zoomControl: false,
      preferCanvas: true,
    })
    map.value = newMap
    newMap.addEventListener('contextmenu', (ev) => {
      console.log('[map contextmenu]', ev)
    })
    mapCreatedHook.trigger(newMap)
  })

  onBeforeUnmount(() => {
    hookUnregisters.value.forEach(off => off())
  })

  return { map, onMapCreated }
}
