import type { Ref } from 'vue'
import type { LeafletEventHandlerFnMap } from 'leaflet'
import { GenshinMap } from '../utils'

export const useMap = (ele: Ref<HTMLElement | null>) => {
  const map = ref<GenshinMap | null>(null) as Ref<GenshinMap | null>
  const hookUnregisters = shallowRef<(() => void)[]>([])
  const listeners = shallowRef<[string, (...args: any[]) => any][]>([])
  const mapCreatedHook = createEventHook<GenshinMap>()
  const stopPropagationSignal = ref(false)

  const onMapCreated = (cb: (mapInstance: GenshinMap) => void) => {
    const { off } = mapCreatedHook.on(cb)
    hookUnregisters.value.push(off)
    return off
  }

  const callWithSignal = (fn: (...args: any[]) => void, ...args: any[]) => {
    if (stopPropagationSignal.value) {
      stopPropagationSignal.value = false
      return
    }
    fn(...args)
  }

  const on = <T extends keyof LeafletEventHandlerFnMap>(type: T, fn: LeafletEventHandlerFnMap[T]) => {
    if (!fn)
      return
    if (!map.value) {
      listeners.value.push([type, (...args) => callWithSignal(fn, ...args)])
      return
    }
    map.value.addEventListener(type, (...args) => callWithSignal(fn, ...args))
  }

  onMounted(() => {
    if (!ele.value)
      return
    const newMap = new GenshinMap(ele.value, {
      center: [-5948, 2176],
      zoom: -3,
      maxZoom: 2,
      minZoom: -4,
      tap: false,
      zoomAnimation: true,
      fadeAnimation: true,
      attributionControl: false,
      zoomControl: false,
      preferCanvas: true,
    })
    listeners.value.forEach(([type, fn]) => newMap.addEventListener(type, (...args) => callWithSignal(fn, ...args)))
    map.value = newMap
    mapCreatedHook.trigger(newMap)
  })

  onBeforeUnmount(() => {
    map.value?.remove()
    map.value = null
    listeners.value = []
    hookUnregisters.value.forEach(off => off())
  })

  return { map, stopPropagationSignal, on, onMapCreated }
}
