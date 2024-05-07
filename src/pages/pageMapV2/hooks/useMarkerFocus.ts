import db from '@/database'
import { useAreaStore, useItemStore, useMapStateStore, usePreferenceStore, useTileStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'
import { useDatabaseHook } from '@/hooks'
import { Logger, messageFrom } from '@/utils'
import { EaseoutInterpolator } from '@/pages/pageMapV2/core/interpolator'

/** 点位 focus 状态管理 hook */
export const _useMarkerFocus = () => {
  const logger = new Logger('markerFocusHook')

  const preferenceStore = usePreferenceStore()
  const mapStateStore = useMapStateStore()
  const areaStore = useAreaStore()
  const itemStore = useItemStore()
  const tileStore = useTileStore()

  /** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
  const cachedMarkerVo = shallowRef<GSMapState.MarkerWithRenderConfig | null>(null)

  const { data: focus, update: updateFocus } = mapStateStore.subscribeInteractionInfo('focus', 'defaultMarker')

  const { data: hover, update: updateHover } = mapStateStore.subscribeInteractionInfo('hover', 'defaultMarker')

  mapStateStore.event.on('click', (info) => {
    if (info.object)
      return
    updateHover(null)
    updateFocus(null)
  })

  const isPopoverActived = computed(() => {
    if (preferenceStore.preference['map.setting.hideMarkerPopover'])
      return false
    return Boolean(mapStateStore.isPopoverOnHover
      ? hover.value
      : focus.value,
    )
  })

  const normalizeMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig): GSMapState.MarkerWithRenderConfig => {
    return 'render' in markerVo
      ? markerVo
      : createRenderMarkers([markerVo], {
        areaIdMap: areaStore.areaIdMap,
        itemIdMap: itemStore.itemIdMap,
        tileConfigs: tileStore.mergedTileConfigs,
      })[0]
  }

  const updateLoading = ref(false)

  // 数据库更新时刷新 focus 缓存
  useDatabaseHook(db.marker, async () => {
    try {
      if (!isPopoverActived.value || !focus.value)
        return
      updateLoading.value = true
      const query = await db.marker.get(focus.value.id!)
      if (!query) {
        updateFocus(null)
        return
      }
      updateFocus(normalizeMarker(query))
    }
    catch (err) {
      logger.error(messageFrom(err))
    }
    finally {
      updateLoading.value = false
    }
  }, ['creating', 'updating', 'deleting'])

  const delayTimer = ref<number>()

  /** 与 focus 相反的行为 */
  const blur = () => {
    mapStateStore.setTempMarkers('focus', [])
    updateFocus(null)
  }

  const focusMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig, {
    delay = 0,
    flyToMarker = false,
  }: {
    delay?: number
    flyToMarker?: boolean
  }) => {
    blur()
    window.clearTimeout(delayTimer.value)
    const markerWithRender = normalizeMarker(markerVo)

    if (delay > 0) {
      delayTimer.value = window.setTimeout(() => {
        updateFocus(markerWithRender)
        delayTimer.value = undefined
      }, delay)
    }
    else {
      updateFocus(markerWithRender)
    }

    if (flyToMarker) {
      const { render: { position: [x, y] } } = markerWithRender
      mapStateStore.event.emit('setViewState', {
        target: [x, y],
        zoom: 0,
        transitionDuration: delay,
        transitionInterpolator: new EaseoutInterpolator(['target', 'zoom']),
      })
    }

    return markerWithRender
  }

  function hoverMarker(markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig | null) {
    if (!markerVo) {
      updateHover(markerVo)
      return
    }
    const markerWithRender = normalizeMarker(markerVo)
    updateHover(markerWithRender)
    return markerWithRender
  }

  /** 与 hover 相反的行为 */
  const out = () => updateHover(null)

  watch(() => [focus.value, hover.value, mapStateStore.isPopoverOnHover] as const, ([currentFocus, currentHover, isPopoverOnHover]) => {
    const target = isPopoverOnHover ? currentHover : currentFocus
    if (!target) {
      !isPopoverOnHover && mapStateStore.setTempMarkers('focus', [])
      return
    }
    cachedMarkerVo.value = target
    !isPopoverOnHover && mapStateStore.setTempMarkers('focus', [target])
  })

  return {
    isPopoverActived,
    cachedMarkerVo,
    hover,
    focus,
    updateLoading,
    normalizeMarker,
    focusMarker,
    blur,
    hoverMarker,
    out,
  }
}

let cache: ReturnType<typeof _useMarkerFocus>

export const useMarkerFocus = () => {
  if (!cache)
    cache = _useMarkerFocus()
  return cache
}
