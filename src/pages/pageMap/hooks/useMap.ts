import type { Ref } from 'vue'
import type { LeafletEventHandlerFnMap } from 'leaflet'
import { GenshinMap } from '../utils'
import type { AnyArray, AnyFunction } from '@/shared'

const map = ref<GenshinMap | null>(null) as Ref<GenshinMap | null>
const stopPropagationSignal = ref(false)

export const useMap = (ele: Ref<HTMLElement | null>) => {
  const hookUnregisters = shallowRef<(() => void)[]>([])
  const listeners = shallowRef<[string, AnyFunction][]>([])

  const callWithSignal = (fn: AnyFunction<void>, ...args: AnyArray) => {
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
    if (!map.value) {
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
      map.value = newMap
    }
    listeners.value.forEach(([type, fn]) => map.value?.addEventListener(type, (...args) => callWithSignal(fn, ...args)))
  })

  onBeforeUnmount(() => {
    map.value?.remove()
    map.value = null
    listeners.value = []
    hookUnregisters.value.forEach(off => off())
  })

  return { map, stopPropagationSignal, on }
}
