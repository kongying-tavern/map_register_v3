import type { Ref } from 'vue'
import { render } from 'vue'
import L from 'leaflet'
import { ElMessage } from 'element-plus'
import { indexOf } from 'lodash'
import type { GenshinLayerOptions } from '../utils'
import { MarkerEditForm, PopupContent } from '../components'
import { canvasMarker } from '../utils'
import { useMap } from './useMap'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook, useGlobalDialog, useIconList, useItemList } from '@/hooks'
import db from '@/database'
import { localSettings } from '@/stores'
import type { MarkerExtra } from '@/utils'
import { ExtraJSON, sleep } from '@/utils'

export interface QueryParams {
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

export interface MarkerHookOptions extends FetchHookOptions<API.RListMarkerVo> {
  /** 已选择的物品 */
  selectedItem?: Ref<API.ItemVo | undefined>
  /** 阻止点位右键事件冒泡 */
  stopPropagationSignal?: Ref<boolean>
  /** 参数函数 */
  params?: () => QueryParams
}

export interface LinkedMapMarker extends API.MarkerPunctuateVo, API.MarkerVo {
  extraObject: MarkerExtra
  coordinate: [number, number]
}

const popupDOM = L.DomUtil.create('div', 'w-full h-full')
const popup = L.popup({ closeButton: false, minWidth: 223, maxWidth: 223, offset: [0, 0] })

/** 预解析点位对象参数 */
export const createLinkMarker = (marker: API.MarkerPunctuateVo | API.MarkerVo): LinkedMapMarker => {
  try {
    return {
      ...marker,
      coordinate: marker.position ? marker.position.split(',').map(Number) as [number, number] : [0, 0],
      extraObject: marker.extra ? ExtraJSON.parse(marker.extra) : {},
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
      ; (!onlyUnderground || linkedMarker.extraObject.underground?.is_underground) && seed.push(linkedMarker)
    return seed
  }

/**
 * 判断是否为特殊点位
 */
export const isSpecial = (itemList: Array<API.MarkerItemLinkVo>, specialItems: Array<number>): boolean => {
  for (const i in itemList) {
    if (indexOf(specialItems, itemList[i].itemId) !== -1)
      return true
  }
  return false
}

// 点位激活时的光标效果
const activeIconMarker = L.marker([0, 0], { interactive: false }).setIcon(
  L.divIcon({
    iconSize: [56, 56],
    // 样式见 src/style/leaflet/index.scss
    className: 'genshin-active-marker',
  }),
)

/** 共享的点位列表 */
const markerList = ref<LinkedMapMarker[]>([])
/** 共享的点位列表加载态，可覆盖 */
const loading = ref(false)

export const useMarker = (options: MarkerHookOptions = {}) => {
  const {
    immediate = false,
    loading: scopedLoading,
    selectedItem = ref(undefined),
    params = () => ({} as QueryParams),
  } = options

  const { map, stopPropagationSignal } = useMap()
  const { itemList } = useItemList()
  const { iconMap, onSuccess: onIconFetched } = useIconList()

  /** 组件实例 */
  const instance = getCurrentInstance()

  /** 请求参数 */
  const fetchParams = computed(() => params?.() ?? {})
  /** 点位图层缓存 */
  const markerLayer = ref<L.Layer | null>(null)
  /** 点位准备渲染的回调函数 */
  const preMarkerCreateCb = ref<(() => void) | null>(null)
  /** 点位相关方法 */
  const { refresh: updateMarkerList, onSuccess: onMarkerFetched, onError, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading ?? loading,
    onRequest: async () => {
      let tempMarkers: (API.MarkerPunctuateVo | API.MarkerVo)[] = []
      if (!map)
        return tempMarkers
      const { rawParams, showAuditedMarker, showPunctuateMarker, showSpecial, specialItems } = fetchParams.value
      if (!rawParams.itemIdList?.length)
        return tempMarkers
      let { itemIdList = [] } = rawParams
      // 特殊点位
      if (showSpecial)
        itemIdList = itemIdList.concat(specialItems)
      // 已通过审核点位
      if (showAuditedMarker) {
        const data = await db.marker.where('itemIdList').anyOf(itemIdList).toArray()
        tempMarkers = tempMarkers.concat(data)
      }
      // 审核中点位
      if (showPunctuateMarker) {
        const { data: { record = [] } = {} } = await Api.punctuate.listPunctuatePage({ current: 0, size: 1000 })
        tempMarkers = tempMarkers.concat(record)
      }
      return tempMarkers
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
    await sleep(100)
    map.value?.flyTo(centerLatlng, map.value.getZoom(), { duration: 0.2 })
  }

  const { DialogService } = useGlobalDialog()

  /** 点位激活时添加类似游戏中选中的效果 */
  const addActiveIconToMarker = (latlng: L.LatLngExpression) => {
    if (!map.value)
      return
    activeIconMarker
      .removeFrom(map.value)
      .setLatLng(latlng)
      .addTo(map.value)
    map.value.once('popupclose', () => {
      map.value && activeIconMarker.removeFrom(map.value)
    })
  }

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
        url: iconMap.value[markerInfo.itemList?.[0]?.iconTag ?? selectedItem?.value?.iconTag ?? ''],
        size: [32, 32],
        rotate: 90,
        offset: { x: 0, y: 0 },
        hiddenFlag: markerInfo.hiddenFlag,
        isUnderground: markerInfo.extraObject.underground?.is_underground,
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
      marker.bringToFront()
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
      addActiveIconToMarker(latlng)
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
    map.value?.closePopup()
    markerLayer.value && map.value?.removeLayer(markerLayer.value as L.Layer)
    // 普通点位
    const mapMarkers = markerList.value.map(createCanvasMarker)
    markerLayer.value = L.layerGroup(mapMarkers)
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
    markerList.value = data.reduce(withCondition(fetchParams.value.onlyUnderground), [])
    createMarkerWhenReady()
  })

  onError((err) => {
    markerList.value = []
    console.warn(err)
    ElMessage.error('点位加载失败')
    createMarkerWhenReady()
  })

  watch(fetchParams, updateMarkerList, { deep: true })

  return { markerList, markerLayer, updateMarkerList, createMarkerWhenReady, onError, ...rest }
}
