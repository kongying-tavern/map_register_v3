import {
  useArchiveStore,
  useMapStateStore,
} from '@/stores'
import type { GSMarkerInfo } from '@/packages/map'
import { EaseoutInterpolator, GSMarkerLayer } from '@/packages/map'
import { createRenderMarkers } from '@/stores/utils'
import { MapSubject } from '@/shared'

let cache: ReturnType<typeof _useMarkerControl>

const MARKER_INTERACTION_KEY = GSMarkerLayer.layerName

export const _useMarkerControl = () => {
  const archiveStore = useArchiveStore()
  const mapStateStore = useMapStateStore()

  const hideMarkerPopover = computed(() => {
    return archiveStore.currentArchive.body.Preference['map.setting.hideMarkerPopover']
  })

  /** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
  const cachedMarkerVo = shallowRef<GSMarkerInfo & { isSnapshot?: boolean } | null>(null)

  const {
    hasHover,
    addFocus,
    addHover,
    removeFocus,
    removeHover,
  } = mapStateStore.interaction

  const updateFocus = (id?: number) => {
    return addFocus(MARKER_INTERACTION_KEY, id, true)
  }

  const focus = computed(() => {
    if (hideMarkerPopover.value)
      return
    if (mapStateStore.isPopoverOnHover) {
      const hoverIds = mapStateStore.interaction.hoverElements.get(MARKER_INTERACTION_KEY)
      if (!hoverIds || hoverIds.size > 1)
        return
      const markerId = hoverIds.values().next().value
      return mapStateStore.currentMarkerIdMap.get(markerId)
    }
    else {
      const focusIds = mapStateStore.interaction.focusElements.get(MARKER_INTERACTION_KEY)
      if (!focusIds || focusIds.size > 1)
        return
      const markerId = focusIds.values().next().value
      return mapStateStore.currentMarkerIdMap.get(markerId)
    }
  })

  const hover = computed(() => {
    if (!hasHover(MARKER_INTERACTION_KEY))
      return undefined
    const hoverIds = mapStateStore.hoverElements.get(MARKER_INTERACTION_KEY)
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
  const blur = () => removeFocus(MARKER_INTERACTION_KEY)

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
        addFocus(MARKER_INTERACTION_KEY, markerWithRender.id, true)
        delayTimer.value = undefined
      }, delay)
    }
    else {
      addFocus(MARKER_INTERACTION_KEY, markerWithRender.id, true)
    }

    if (flyToMarker) {
      const { render: { position: [x, y] } } = markerWithRender
      MapSubject.viewState.next({
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
      removeHover(MARKER_INTERACTION_KEY)
      return
    }
    const markerWithRender = normalizeMarker(markerVo)
    addHover(MARKER_INTERACTION_KEY, markerWithRender.id)
    return markerWithRender
  }

  /** 与 hover 相反的行为 */
  const out = () => removeHover(MARKER_INTERACTION_KEY)

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
