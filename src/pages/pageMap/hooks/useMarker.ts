import type { Ref } from 'vue'
import { render } from 'vue'
import L from 'leaflet'
import { ElMessage } from 'element-plus'
import { indexOf } from 'lodash'
import type { GenshinLayerOptions, GenshinMap } from '../utils'
import { MarkerEditForm, PopupContent } from '../components'
import { canvasMarker } from '../utils'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook, useGlobalDialog, useIconList } from '@/hooks'

export interface MarkerHookOptions extends FetchHookOptions<API.RListMarkerVo> {
  /** 物品列表 */
  itemList: Ref<API.ItemVo[]>
  /** 已选择的物品 */
  selectedItem: Ref<API.ItemVo | undefined>
  /** 阻止点位右键事件冒泡 */
  stopPropagationSignal: Ref<boolean>
  /** 参数函数 */
  params: () => {
    rawParams: API.MarkerSearchVo
    /** 显示审核中点位 */
    showPunctuateMarker: boolean
    /** 显示审核通过点位 */
    showAuditedMarker: boolean
    /** 只显示地下点位 */
    onlyUnderground: boolean
    /** 常驻显示特殊点位(如: 锚点、洞口) */
    showSpecial: boolean
    /** 常驻显示特殊物品列表 */
    specialItems: Array<number>
  }
}

export interface LinkedMapMarker extends API.MarkerPunctuateVo, API.MarkerVo {
  // TODO extra 类型应当通过特殊封装的 extra 解析函数来获取
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraObject?: any
  coordinate: [number, number]
}

const popupDOM = L.DomUtil.create('div', 'w-full h-full')
const popup = L.popup({ closeButton: false, minWidth: 223, maxWidth: 223, offset: [0, 0] })

/** 预解析点位对象参数 */
const createLinkMarker = (marker: API.MarkerPunctuateVo | API.MarkerVo): LinkedMapMarker => {
  try {
    return {
      ...marker,
      coordinate: marker.position ? marker.position.split(',').map(Number) as [number, number] : [0, 0],
      extraObject: marker.extra ? JSON.parse(marker.extra) : {},
    }
  }
  catch {
    // TODO 错误处理
    return {
      ...marker,
      coordinate: [0, 0],
      extraObject: {},
    }
  }
}

/** @函数柯里化 根据是否仅显示地下点位，给出对应的处理函数 */
const withCondition = (onlyUnderground?: boolean) =>
  (seed: LinkedMapMarker[], marker: API.MarkerPunctuateVo | API.MarkerVo) => {
    const linkedMarker = createLinkMarker(marker)
    ;(!onlyUnderground || linkedMarker.extraObject.underground?.is_underground) && seed.push(linkedMarker)
    return seed
  }

const isSpecial = (itemList: Array<API.MarkerItemLinkVo>, specialItems: Array<number>): boolean => {
  for (const i in itemList) {
    if (indexOf(specialItems, itemList[i].itemId) !== -1)
      return true
  }
  return false
}

export const useMarker = (map: Ref<GenshinMap | null>, options: MarkerHookOptions) => {
  const {
    immediate = false,
    stopPropagationSignal,
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
  /** 特殊点位列表 */
  const specialMarkerList = ref<LinkedMapMarker[]>([])
  /** 请求参数 */
  const fetchParams = computed(() => params())
  /** 点位图层缓存 */
  const markerLayer = ref<L.Layer | null>(null)
  /** 点位准备渲染的回调函数 */
  const preMarkerCreateCb = ref<(() => void) | null>(null)
  /** 点位相关方法 */
  const { refresh: updateMarkerList, onSuccess: onMarkerFetched, onError, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      map.value?.closePopup()
      const { rawParams, showAuditedMarker, showPunctuateMarker, onlyUnderground, showSpecial, specialItems } = fetchParams.value
      if (!rawParams.itemIdList?.length)
        return []
      let linkedMarkers: LinkedMapMarker[] = []
      let specialMarkers: LinkedMapMarker[] = []
      // 已通过审核点位
      if (showAuditedMarker) {
        const { data = [] } = await Api.marker.searchMarker({}, rawParams)
        linkedMarkers = linkedMarkers.concat(data.reduce(withCondition(onlyUnderground), [] as LinkedMapMarker[]))
      }
      // 审核中点位
      if (showPunctuateMarker) {
        const { data: { record = [] } = {} } = await Api.punctuate.listPunctuatePage({ current: 0, size: 1000 })
        linkedMarkers = linkedMarkers.concat(record.reduce(withCondition(onlyUnderground), [] as LinkedMapMarker[]))
      }
      // 特殊点位
      if (showSpecial) {
        const { data = [] } = await Api.marker.searchMarker({}, { itemIdList: specialItems })
        specialMarkers = data.reduce(withCondition(onlyUnderground), [] as LinkedMapMarker[])
      }
      return { linkedMarkers, specialMarkers }
    },
  })

  /**
   * 根据点位坐标将地图移动到点集中心
   */
  const moveToCenter = async (markers: L.CircleMarker[]) => {
    if (!localSettings.value.moveToCenter || !markers.length)
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
    await new Promise(resolve => setTimeout(resolve, 100))
    map.value?.flyTo(centerLatlng, map.value.getZoom(), { duration: 0.2 })
  }

  const { DialogService } = useGlobalDialog()

  /** 根据点位信息创建 canvas 图层上的点位 */
  const createCanvasMarker = (markerInfo: LinkedMapMarker) => {
    const { specialItems } = fetchParams.value
    const latlng = L.latLng(markerInfo.coordinate)

    const marker = canvasMarker(latlng, {
      prevLatlng: latlng,
      img: {
        markerId: markerInfo.id,
        punctuateId: markerInfo.punctuateId,
        /** 当前 marker 对应的图片地址，不统一跟物品走，所以这里有两个可用项 */
        url: iconMap.value[markerInfo.itemList?.[0].iconTag ?? selectedItem.value?.iconTag ?? ''],
        size: [32, 32],
        rotate: 90,
        offset: { x: 0, y: 0 },
        hiddenFlag: markerInfo.hiddenFlag,
        isUnderground: 'underground' in markerInfo.extraObject ? markerInfo.extraObject.underground.is_underground : false,
        specialFlag: isSpecial(markerInfo.itemList ?? [], specialItems),
      },
      undergroundImg: {},
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
        latlng,
        onCommand,
        onRefresh: updateMarkerList,
      })
      // 理论上给了 appContext 就可以使用依赖注入，不用再繁琐的传递属性了
      vnode.appContext = instance?.appContext ?? null
      render(vnode, popupDOM)
      // 不在创建点位时预渲染 content 是为了降低点位整体的渲染用时
      popup.setContent(popupDOM).setLatLng(latlng).openOn(map.value)
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

  /** @核心流程 创建点位实例 */
  const createMarkers = () => {
    markerLayer.value && map.value?.removeLayer(markerLayer.value as L.Layer)
    // 普通点位
    const mapMarkers = markerList.value.map(createCanvasMarker)
    // 特殊点位
    const specialMarkers = specialMarkerList.value.map(createCanvasMarker)
    markerLayer.value = L.layerGroup(mapMarkers.concat(specialMarkers))
    map.value?.addLayer(markerLayer.value as L.Layer)
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

  onMarkerFetched((data) => {
    if ('linkedMarkers' in data) {
      const { linkedMarkers, specialMarkers } = data
      markerList.value = linkedMarkers
      specialMarkerList.value = specialMarkers
      createMarkerWhenReady()
    }
  })

  onError((err) => {
    markerList.value = []
    console.warn(err)
    ElMessage.error('点位加载失败')
    createMarkerWhenReady()
  })

  watch(fetchParams, updateMarkerList, { deep: true })

  return { iconMap, markerList, markerLayer, updateMarkerList, createMarkerWhenReady, onError, ...rest }
}
