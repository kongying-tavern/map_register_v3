import type { Ref, ShallowRef } from 'vue'
import type { LeafletEvent, LeafletEventHandlerFnMap } from 'leaflet'
import { GenshinMap } from '@/pages/pageMap/core'
import type { MapTileConfig } from '@/pages/pageMap/configs'
import type { AnyArray, AnyFunction } from '@/shared'
import { useMapStore } from '@/stores'

export interface BaseLayerChangeEvent extends L.LayersControlEvent {
  layerConfig?: MapTileConfig
}

const map = shallowRef<GenshinMap | null>(null) as ShallowRef<GenshinMap | null>
const stopPropagationSignal = ref(false)

export const useMap = (ele?: Ref<HTMLElement | null>) => {
  const mapStore = useMapStore()

  const scopedListeners = shallowRef<[string, AnyFunction][]>([])

  const callWithSignal = (fn: AnyFunction<void>, ...args: AnyArray) => {
    if (stopPropagationSignal.value) {
      stopPropagationSignal.value = false
      return
    }
    fn(...args)
  }

  /** 监听地图事件，当组件卸载时在该组件内注册的地图事件监听器也会被卸载 */
  const on = <T extends keyof LeafletEventHandlerFnMap>(type: T, fn: LeafletEventHandlerFnMap[T]) => {
    if (!fn)
      return
    scopedListeners.value.push([type, (...args) => callWithSignal(fn, ...args)])
  }

  // 以下监听器只会在 ele 存在时（即 map 实例存在的组件）被附加

  ele && on('zoom', (ev) => {
    mapStore.zoom = (ev.target as GenshinMap).getZoom()
  })

  ele && on('move', useDebounceFn((ev: LeafletEvent) => {
    const center = (ev.target as GenshinMap).getCenter()
    mapStore.center = [Math.floor(center.lat), Math.floor(center.lng)]
  }, 500))

  ele && on('baselayerchange', (ev: BaseLayerChangeEvent) => {
    if (!mapStore.center) {
      mapStore.center = ev.layerConfig?.settings?.center as [number, number]
      mapStore.zoom = ev.layerConfig?.settings?.zoom as number
      return
    }
    map.value?.flyTo(mapStore.center, mapStore.zoom ?? 0, {
      duration: 0.1,
    })
  })

  // 使用替代滚轮缩放
  ele && useEventListener(ele, 'wheel', (ev: WheelEvent) => {
    if (!map.value)
      return
    const { zoomDelta = 1 } = map.value.options
    const currentZoom = map.value.getZoom()
    const newZoom = currentZoom - (ev.deltaY * zoomDelta / 100)
    map.value.setZoom(newZoom, { duration: 1 })
  })

  onMounted(() => {
    if (!ele?.value || map.value)
      return
    const newMap = new GenshinMap(ele.value, {
      center: [-5948, 2176],
      zoom: -3,
      maxZoom: 2,
      minZoom: -4,
      tap: false,
      scrollWheelZoom: false,
      zoomAnimation: true,
      fadeAnimation: true,
      zoomDelta: 0.5,
      zoomSnap: 0.5,
      attributionControl: false,
      zoomControl: false,
      preferCanvas: true,
    })
    map.value = newMap
  })

  watch(map, (mapInstance) => {
    mapInstance && scopedListeners.value.forEach(([type, fn]) => mapInstance.on(type, (...args) => callWithSignal(fn, ...args)))
  })

  onBeforeUnmount(() => {
    if (ele) {
      map.value?.remove()
      map.value = null
    }
    scopedListeners.value.forEach(([type, fn]) => {
      map.value?.off(type, fn)
    })
  })

  return { map, stopPropagationSignal, on }
}
