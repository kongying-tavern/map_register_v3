import type { Ref } from 'vue'
import { render } from 'vue'
import L from 'leaflet'
import { ElMessage } from 'element-plus'
import type { GenshinLayerOptions, GenshinMap } from '../utils'
import { PopupContent } from '../components'
import { canvasMarker } from '../utils'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook, useIconList } from '@/hooks'

export interface MarkerHookOptions extends FetchHookOptions<API.RListMarkerVo> {
  watchParams?: boolean
  stopPropagationSignal: Ref<boolean>
  selectedItem: Ref<API.ItemVo | undefined>
  params?: () => API.MarkerSearchVo
}

export interface LinkedMapMarker extends API.MarkerVo {
  mapMarker?: L.CircleMarker
}

const popupDOM = L.DomUtil.create('div', 'w-full h-full')
const popup = L.popup({ closeButton: false, minWidth: 223, maxWidth: 223, offset: [0, 0] })

export const useMarker = (map: Ref<GenshinMap | null>, options: MarkerHookOptions) => {
  const { immediate = false, stopPropagationSignal, watchParams = true, selectedItem, loading = ref(false), params } = options

  const { iconMap, onSuccess: onIconFetched } = useIconList()

  /** 点位列表 */
  const markerList = ref<LinkedMapMarker[]>([])
  /** 请求参数 */
  const fetchParams = computed(() => params?.())
  /** 点位图层缓存 */
  const markerLayer = ref<L.Layer | null>(null)
  /** 点位准备渲染的回调函数 */
  const preMarkerCreateCb = ref<(() => void) | null>(null)
  /** 当前选择的 item 对应的图片地址 */
  const iconUrl = computed(() => iconMap.value[selectedItem.value?.iconTag ?? ''])
  /** 点位相关方法 */
  const { refresh: updateMarkerList, onSuccess: onMarkerFetched, onError, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      map.value?.closePopup()
      if (!fetchParams.value?.itemIdList?.length)
        return {}
      return await Api.marker.searchMarker({}, { ...fetchParams.value })
    },
  })

  /**
   * 根据点位坐标将地图移动到点集中心
   * @todo 可以根据全局设置做成可选功能
   */
  const moveToCenter = (markers: L.CircleMarker[]) => {
    if (!markers.length)
      return
    const { xmin, xmax, ymin, ymax } = markers.slice(1).reduce((rect, marker) => {
      const { lat, lng } = marker.getLatLng()
      if (lat < rect.xmin)
        rect.xmin = lat
      else if (lat > rect.xmax)
        rect.xmax = lat
      if (lng < rect.ymin)
        rect.ymin = lng
      else if (lng > rect.ymax)
        rect.ymax = lng
      return rect
    }, (() => {
      const { lat, lng } = markers[0].getLatLng()
      return { xmin: lat, xmax: lat, ymin: lng, ymax: lng }
    })())
    const centerLatlng: [number, number] = [(xmin + xmax) / 2, (ymin + ymax) / 2]
    // 延迟到点位渲染大致完成后再移动视野，以避免同时移动视野导致的卡顿
    setTimeout(() => {
      map.value?.flyTo(centerLatlng, map.value.getZoom(), { duration: 0.3 })
    }, 500)
  }

  /** 根据点位信息创建 canvas 图层上的点位 */
  const createCanvasMarker = (markerInfo: API.MarkerVo) => {
    const { position = '0,0' } = markerInfo
    const coordinates = L.latLng(position.split(',').map(Number) as [number, number])
    const marker = canvasMarker(coordinates, {
      prevLatlng: coordinates,
      img: {
        markerId: markerInfo.id,
        url: iconUrl.value,
        size: [32, 32],
        rotate: 90,
        offset: { x: 0, y: 0 },
        hiddenFlag: markerInfo.hiddenFlag,
      },
    })

    const markerOptions = marker.options as GenshinLayerOptions

    marker.addEventListener('click', () => {
      if (!map.value)
        return
      markerOptions.img.popperOpen = true
      render(h(PopupContent, {
        markerInfo,
        latlng: coordinates,
        onRefresh: updateMarkerList,
      }), popupDOM)
      popup.setContent(popupDOM)
        .setLatLng(coordinates)
        .openOn(map.value)
      map.value.addOneTimeEventListener('popupclose', () => {
        markerOptions.img.popperOpen = false
        marker.redraw()
      })
      marker.redraw()
    })
    marker.addEventListener('mousedown', () => {
      markerOptions.img.active = true
      const stop = useEventListener('pointerup', () => {
        markerOptions.img.active = false
        stop()
      })
      marker.redraw()
    })
    marker.addEventListener('mouseover', () => {
      markerOptions.img.hover = true
      marker.redraw()
    })
    marker.addEventListener('mouseout', () => {
      markerOptions.img.hover = false
      marker.redraw()
    })
    marker.addEventListener('contextmenu', () => {
      stopPropagationSignal.value = true
    })

    return marker
  }

  /** 更新点位图层 */
  const refreshMarkerLayer = (markers: L.CircleMarker[]) => {
    markerLayer.value && map.value?.removeLayer(markerLayer.value as L.Layer)
    markerLayer.value = L.layerGroup(markers)
    map.value?.addLayer(markerLayer.value as L.Layer)
  }

  /** @核心流程 创建点位实例 */
  const createMarkers = () => {
    const mapMarkers = markerList.value.map(createCanvasMarker)
    refreshMarkerLayer(mapMarkers)
    moveToCenter(mapMarkers)
  }

  /** 当图标和点位均准备好时才开始渲染 */
  const createMarkerWhenReady = () => {
    if (!preMarkerCreateCb.value) {
      preMarkerCreateCb.value = createMarkers
      return
    }
    preMarkerCreateCb.value()
  }

  onIconFetched(createMarkerWhenReady)

  onMarkerFetched(({ data = [] }) => {
    markerList.value = data
    createMarkerWhenReady()
  })

  onError(() => {
    markerList.value = []
    ElMessage.error('点位加载失败')
    createMarkerWhenReady()
  })

  watchParams && params && watch(fetchParams, updateMarkerList, { deep: true })

  return { iconMap, markerList, markerLayer, updateMarkerList, createMarkerWhenReady, onError, ...rest }
}
