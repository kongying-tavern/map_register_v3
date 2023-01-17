import type { Ref } from 'vue'
import { render } from 'vue'
import L from 'leaflet'
import { ElMessage } from 'element-plus'
import type { GenshinLayerOptions, GenshinMap } from '../utils'
import { MarkerEditForm, PopupContent } from '../components'
import { canvasMarker } from '../utils'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook, useGlobalDialog, useIconList } from '@/hooks'
import { useUserStore } from '@/stores'

export interface MarkerHookOptions extends FetchHookOptions<API.RListMarkerVo> {
  watchParams?: boolean
  itemList: Ref<API.ItemVo[]>
  stopPropagationSignal: Ref<boolean>
  selectedItem: Ref<API.ItemVo | undefined>
  showPunctuate: Ref<boolean> // 显示待审核点位
  showMarker: Ref<boolean> // 显示已审核点位
  params?: () => API.MarkerSearchVo
}

export interface LinkedMapMarker extends API.MarkerPunctuateVo {
  mapMarker?: L.CircleMarker
}

const popupDOM = L.DomUtil.create('div', 'w-full h-full')
const popup = L.popup({ closeButton: false, minWidth: 223, maxWidth: 223, offset: [0, 0] })

export const useMarker = (map: Ref<GenshinMap | null>, options: MarkerHookOptions) => {
  const {
    immediate = false,
    stopPropagationSignal,
    watchParams = true,
    itemList,
    selectedItem,
    loading = ref(false),
    params,
  } = options

  const { iconMap, onSuccess: onIconFetched } = useIconList()

  /** 组件实例 */
  const instance = getCurrentInstance()

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
  const { refresh: updatePassedMarkerList, onSuccess: onMarkerFetched, onError, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      map.value?.closePopup()
      if (!fetchParams.value?.itemIdList?.length)
        return {}
      return await Api.marker.searchMarker({}, fetchParams.value)
    },
  })

  /** 待审核点位相关方法(打点员) */
  const { refresh: updatePunctuateMarkerList, onSuccess: onPunctuateMarkerFetched, onError: onError1 } = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      map.value?.closePopup()
      if (!fetchParams.value?.itemIdList?.length)
        return {}
      return await Api.punctuate.listSelfPunctuatePage({ authorId: useUserStore().info.id ?? 0 }, { current: 0, size: 1000 })
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
      map.value?.flyTo(centerLatlng, map.value.getZoom(), { duration: 0.2 })
    }, 100)
  }

  const { DialogService } = useGlobalDialog()

  /** 刷新点位 */
  const updateMarkerList = () => {
    markerList.value = []
    if (options.showPunctuate.value)
      updatePunctuateMarkerList()
    if (options.showMarker.value)
      updatePassedMarkerList()
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    createMarkerWhenReady()
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

    const onCommand = (command: string) => ({
      edit: () => DialogService
        .config({
          title: `编辑点位：${markerInfo.id} - ${markerInfo.markerTitle}`,
          top: '5vh',
          width: 'fit-content',
          class: 'transition-all',
        })
        .props({
          markerInfo,
          iconMap: iconMap.value,
          itemList: itemList.value,
        })
        .listeners({
          refresh: updateMarkerList,
        })
        .open(MarkerEditForm),
    } as Record<string, () => void>)[command]?.()

    marker.addEventListener('click', () => {
      if (!map.value)
        return
      markerOptions.img.popperOpen = true
      const vnode = h(PopupContent, {
        markerInfo,
        latlng: coordinates,
        onCommand,
        onRefresh: updateMarkerList,
      })
      // 理论上给了 appContext 就可以使用依赖注入，不用再繁琐的传递属性了
      vnode.appContext = instance?.appContext ?? null
      render(vnode, popupDOM)
      popup
        .setContent(popupDOM)
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
    markerList.value = markerList.value.concat(data)
    createMarkerWhenReady()
  })

  onPunctuateMarkerFetched(({ data = { record: [] } }) => {
    const record = data.record
    markerList.value = markerList.value.concat(record)
    createMarkerWhenReady()
  })

  onError(() => {
    markerList.value = []
    ElMessage.error('点位加载失败')
    createMarkerWhenReady()
  })

  onError1(() => {
    markerList.value = []
    ElMessage.error('点位加载失败')
    createMarkerWhenReady()
  })

  watchParams && params && watch(fetchParams, updateMarkerList, { deep: true })

  return { iconMap, markerList, markerLayer, updateMarkerList, createMarkerWhenReady, onError, ...rest }
}
