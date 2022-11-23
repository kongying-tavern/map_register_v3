import type { Ref } from 'vue'
import L from 'leaflet'
import type { GenshinMap } from '../utils'
import { canvasMarker } from '../utils'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook, useIconList } from '@/hooks'

export interface MarkerHookOptions extends FetchHookOptions<API.RListMarkerVo> {
  watchParams?: boolean
  selectedItem?: Ref<API.ItemVo | undefined>
  params?: () => API.MarkerSearchVo
}

export const useMarker = (map: Ref<GenshinMap | null>, options: MarkerHookOptions) => {
  const { watchParams = true, selectedItem, loading = ref(false), params, onSuccess, ...rest } = options

  const markerList = ref<API.MarkerVo[]>([])
  const queryBody = computed(() => params?.())
  const markerLayerCache = ref<L.Layer | null>(null)
  const iconLoadedHook = createEventHook<void>()
  const markerLoadedHook = createEventHook<void>()
  const preMarkerCreateCb = ref<(() => void) | null>(null)

  const { iconMap } = useIconList({
    immediate: true,
    onSuccess: () => {
      iconLoadedHook.trigger()
    },
  })

  const iconUrl = computed(() => {
    const iconTag = selectedItem?.value?.iconTag
    return iconMap.value[iconTag ?? '']
  })

  const createMarkers = () => {
    const mapMarkers = markerList.value.map((markerInfo) => {
      const { position = '0,0', content = '暂无说明' } = markerInfo
      const coordinates = L.latLng(position.split(',').map(Number) as [number, number])
      const marker = canvasMarker(coordinates, {
        prevLatlng: coordinates,
        img: {
          url: iconUrl.value,
          size: [32, 32],
          rotate: 90,
          offset: { x: 0, y: 0 },
        },
      })
      // 绑定说明
      // TODO 后期改为全局单例组件
      marker.bindPopup(content)
      return marker
    })

    markerLayerCache.value && map.value?.removeLayer(markerLayerCache.value as L.Layer)
    markerLayerCache.value = L.layerGroup(mapMarkers)
    map.value?.addLayer(markerLayerCache.value as L.Layer)
  }

  const { refresh } = useFetchHook({
    ...rest,
    loading,
    onRequest: async () => {
      if (!queryBody.value?.itemIdList?.length)
        return {}
      return await Api.marker.searchMarker({}, { ...queryBody.value })
    },
    onSuccess: (res) => {
      markerList.value = res.data ?? []
      markerLoadedHook.trigger()
      onSuccess?.(res)
    },
  })

  watchParams && params && watch(queryBody, refresh, { deep: true })

  const createMarkerWhenReady = () => {
    if (!preMarkerCreateCb.value) {
      preMarkerCreateCb.value = createMarkers
      return
    }
    createMarkers()
  }

  // 仅当 icons 准备好时才进行 markers 的创建
  // TODO：逻辑需要改善
  iconLoadedHook.on(createMarkerWhenReady)
  markerLoadedHook.on(createMarkerWhenReady)

  return { markerList, markerLayer: markerLayerCache, loading, updateMarkerList: refresh }
}
