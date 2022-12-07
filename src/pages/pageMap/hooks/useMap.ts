import type { Ref } from 'vue'
import type { LeafletEventHandlerFnMap } from 'leaflet'
import { GenshinMap } from '../utils'

export const useMap = (ele: Ref<HTMLElement | null>) => {
  const map = ref<GenshinMap | null>(null) as Ref<GenshinMap | null>
  const hookUnregisters = shallowRef<(() => void)[]>([])
  const listeners = shallowRef<[string, (...args: any[]) => any][]>([])
  const mapCreatedHook = createEventHook<GenshinMap>()

  const onMapCreated = (cb: (mapInstance: GenshinMap) => void) => {
    const { off } = mapCreatedHook.on(cb)
    hookUnregisters.value.push(off)
    return off
  }

  const on = <T extends keyof LeafletEventHandlerFnMap>(type: T, fn: LeafletEventHandlerFnMap[T]) => {
    if (!fn)
      return
    if (!map.value) {
      listeners.value.push([type, fn])
      return
    }
    map.value.addEventListener(type, fn as any)
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
    listeners.value.forEach(([type, fn]) => newMap.addEventListener(type, fn))
    map.value = newMap
    mapCreatedHook.trigger(newMap)
  })

  onBeforeUnmount(() => {
    map.value?.remove()
    map.value = null
    listeners.value = []
    hookUnregisters.value.forEach(off => off())
  })

  return { map, on, onMapCreated }
}
