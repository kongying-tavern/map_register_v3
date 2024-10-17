import {
  useArchiveStore,
  useMapStateStore,
} from '@/stores'
import type { GSMarkerInfo } from '@/packages/map'
import { EaseoutInterpolator } from '@/packages/map'
import { createRenderMarkers } from '@/stores/utils'

let cache: ReturnType<typeof _useMarkerControl>

export const _useMarkerControl = () => {
  const archiveStore = useArchiveStore()
  const mapStateStore = useMapStateStore()

  const hideMarkerPopover = computed(() => {
    return archiveStore.currentArchive.body.Preference['map.setting.hideMarkerPopover']
  })

  /** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
  const cachedMarkerVo = shallowRef<GSMarkerInfo & { isSnapshot?: boolean } | null>(null)

  const { hasFocus, hasHover, addFocus, addHover, removeFocus, removeHover } = mapStateStore

  const updateFocus = (id?: number) => {
    return addFocus('marker', id, true)
  }

  mapStateStore.event.on('click', (info) => {
    if (info.object)
      return
    removeHover('marker')
    removeFocus('marker')
  })

  const focus = computed(() => {
    if (hideMarkerPopover.value)
      return
    if (mapStateStore.isPopoverOnHover) {
      if (!hasHover('marker'))
        return undefined
      const hoverIds = mapStateStore.hoverElements.get('marker')
      if (!hoverIds || hoverIds.size > 1)
        return
      const markerId = hoverIds.values().next().value
      return mapStateStore.currentMarkerIdMap.get(markerId)
    }
    else {
      if (!hasFocus('marker'))
        return undefined
      const focusIds = mapStateStore.focusElements.get('marker')
      if (!focusIds || focusIds.size > 1)
        return
      const markerId = focusIds.values().next().value
      return mapStateStore.currentMarkerIdMap.get(markerId)
    }
  })

  const hover = computed(() => {
    if (!hasHover('marker'))
      return undefined
    const hoverIds = mapStateStore.hoverElements.get('marker')
    if (!hoverIds || hoverIds.size > 1)
      return
    const markerId = hoverIds.values().next().value
    return mapStateStore.currentMarkerIdMap.get(markerId)
  })

  /** 快照模式，点位只能查看不可交互 */
  const isSnapshot = ref(false)

  const isPopoverActived = computed(() => focus.value !== undefined)

  whenever(() => !focus.value, () => {
    isSnapshot.value = false
    mapStateStore.setTempMarkers('focus', [])
  })

  const normalizeMarker = (markerVo: API.MarkerVo | GSMarkerInfo): GSMarkerInfo => {
    return 'render' in markerVo
      ? markerVo
      : createRenderMarkers([markerVo])[0]
  }

  const updateLoading = ref(false)

  const delayTimer = ref<number>()

  /** 与 focus 相反的行为 */
  const blur = () => removeFocus('marker')

  const focusMarker = (markerVo: API.MarkerVo | GSMarkerInfo, {
    delay = 0,
    duration = 400,
    flyToMarker = false,
    snapshot = false,
  }: {
    delay?: number
    duration?: number
    flyToMarker?: boolean
    snapshot?: boolean
  }) => {
    blur()
    window.clearTimeout(delayTimer.value)
    const markerWithRender = normalizeMarker(markerVo)

    mapStateStore.setTempMarkers('focus', [markerWithRender])
    isSnapshot.value = snapshot

    if (delay > 0) {
      delayTimer.value = window.setTimeout(() => {
        addFocus('marker', markerWithRender.id, true)
        delayTimer.value = undefined
      }, delay)
    }
    else {
      addFocus('marker', markerWithRender.id, true)
    }

    if (flyToMarker) {
      const { render: { position: [x, y] } } = markerWithRender
      mapStateStore.event.emit('setViewState', {
        target: [x, y],
        zoom: 0,
        transitionDuration: duration,
        transitionInterpolator: new EaseoutInterpolator(['target', 'zoom']),
      })
    }

    return markerWithRender
  }

  const hoverMarker = (markerVo: API.MarkerVo | GSMarkerInfo | null) => {
    if (!markerVo) {
      removeHover('marker')
      return
    }
    const markerWithRender = normalizeMarker(markerVo)
    addHover('marker', markerWithRender.id)
    return markerWithRender
  }

  /** 与 hover 相反的行为 */
  const out = () => removeHover('marker')

  watch(() => [focus.value, mapStateStore.isPopoverOnHover] as const, ([currentFocus, isPopoverOnHover]) => {
    if (!currentFocus) {
      !isPopoverOnHover && mapStateStore.setTempMarkers('focus', [])
      return
    }
    cachedMarkerVo.value = {
      ...currentFocus,
      isSnapshot: isSnapshot.value,
    }
    !isPopoverOnHover && mapStateStore.setTempMarkers('focus', [currentFocus])
  })

  return {
    isPopoverActived,
    cachedMarkerVo,
    hover,
    focus,
    updateLoading,
    normalizeMarker,
    focusMarker,
    updateFocus,
    blur,
    hoverMarker,
    out,
  }
}

export const useMarkerControl = () => {
  if (!cache)
    cache = _useMarkerControl()
  return cache
}
