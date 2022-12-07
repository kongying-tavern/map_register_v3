import type { Ref } from 'vue'
import L from 'leaflet'
import type { GenshinLayerOptions, GenshinMap } from '../utils'
import { canvasMarker, createContent } from '../utils'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook, useIconList } from '@/hooks'

export interface MarkerHookOptions extends FetchHookOptions<API.RListMarkerVo> {
  watchParams?: boolean
  selectedItem?: Ref<API.ItemVo | undefined>
  params?: () => API.MarkerSearchVo
}

export const useMarker = (map: Ref<GenshinMap | null>, options: MarkerHookOptions) => {
  const { immediate = false, watchParams = true, selectedItem, loading = ref(false), params } = options

  /** 点位列表 */
  const markerList = ref<API.MarkerVo[]>([])
  /** 请求参数 */
  const fetchParams = computed(() => params?.())
  /** 点位图层缓存 */
  const markerLayerCache = ref<L.Layer | null>(null)
  /** 点位准备渲染的回调函数 */
  const preMarkerCreateCb = ref<(() => void) | null>(null)

  const { iconMap, onSuccess: OnIconFetched } = useIconList({
    immediate: true,
  })

  /** 当前选择的 item 对应的图片地址 */
  const iconUrl = computed(() => iconMap.value[selectedItem?.value?.iconTag ?? ''])

  /** 创建点位实例 */
  const createMarkers = () => {
    const mapMarkers = markerList.value.map((markerInfo) => {
      const { position = '0,0' } = markerInfo
      const coordinates = L.latLng(position.split(',').map(Number) as [number, number])
      const marker = canvasMarker(coordinates, {
        prevLatlng: coordinates,
        img: {
          url: iconUrl.value,
          size: [32, 32],
          rotate: 90,
          offset: { x: 0, y: 0 },
          hiddenFlag: markerInfo.hiddenFlag,
        },
      })

      const popper = createContent(markerInfo)
      const popperOptions: L.PopupOptions = {
        closeButton: false,
        minWidth: 223,
        maxWidth: 223,
        offset: [0, 0],
      }

      marker.addEventListener('click', () => {
        (marker.options as GenshinLayerOptions).img.popperOpen = true
        marker.bindPopup(popper, popperOptions).openPopup(coordinates)
        marker.redraw()
      })
      marker.addEventListener('popupclose', () => {
        (marker.options as GenshinLayerOptions).img.popperOpen = false
        marker.unbindPopup()
        marker.redraw()
      })
      marker.addEventListener('mousedown', () => {
        (marker.options as GenshinLayerOptions).img.active = true
        const stop = useEventListener('pointerup', () => {
          (marker.options as GenshinLayerOptions).img.active = false
          stop()
        })
        marker.redraw()
      })
      marker.addEventListener('mouseover', () => {
        (marker.options as GenshinLayerOptions).img.hover = true
        marker.redraw()
      })
      marker.addEventListener('mouseout', () => {
        (marker.options as GenshinLayerOptions).img.hover = false
        marker.redraw()
      })

      return marker
    })

    markerLayerCache.value && map.value?.removeLayer(markerLayerCache.value as L.Layer)
    markerLayerCache.value = L.layerGroup(mapMarkers)
    map.value?.addLayer(markerLayerCache.value as L.Layer)
  }

  /** 当图标和点位均准备好时才开始渲染 */
  const createMarkerWhenReady = () => {
    if (!preMarkerCreateCb.value) {
      preMarkerCreateCb.value = createMarkers
      return
    }
    preMarkerCreateCb.value()
  }

  const { refresh, onSuccess: OnMarkerFetched, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      if (!fetchParams.value?.itemIdList?.length)
        return {}
      return await Api.marker.searchMarker({}, { ...fetchParams.value })
    },
  })

  OnIconFetched(createMarkerWhenReady)

  OnMarkerFetched(({ data = [] }) => {
    markerList.value = data
    createMarkerWhenReady()
  })

  watchParams && params && watch(fetchParams, refresh, { deep: true })

  return { markerList, markerLayer: markerLayerCache, updateMarkerList: refresh, createMarkerWhenReady, ...rest }
}
