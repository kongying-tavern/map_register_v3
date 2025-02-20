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
// TODO 临时偏移量，后续改为根据侧边栏和视口尺寸实时计算
const FLY_OFFSET = [-200, -200]

const _useMarkerControl = () => {
  const archiveStore = useArchiveStore()
  const mapStateStore = useMapStateStore()

  const hideMarkerPopover = computed(() => {
    return archiveStore.currentArchive.body.Preference['map.setting.hideMarkerPopover']
  })

  /** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
  const cachedMarkerId = ref<number>()

  const cachedMarkerVo = computed<GSMarkerInfo | null>(() => {
    if (cachedMarkerId.value == undefined)
      return null
    return mapStateStore.currentMarkerIdMap.get(cachedMarkerId.value) ?? null
  })

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

  const { isProcessing: isMultiSelecting } = mapStateStore.subscribeMission('markerMultiSelect', () => '')

  const focus = computed(() => {
    if (isMultiSelecting.value || hideMarkerPopover.value)
      return
    if (mapStateStore.interaction.isPopoverOnHover) {
      const hoverIds = mapStateStore.interaction.hoverElements.get(MARKER_INTERACTION_KEY) as (Set<number> | undefined)
      if (!hoverIds || hoverIds.size > 1)
        return
      const markerId = hoverIds.values().next().value!
      return mapStateStore.currentMarkerIdMap.get(markerId)
    }
    else {
      const focusIds = mapStateStore.interaction.focusElements.get(MARKER_INTERACTION_KEY) as (Set<number> | undefined)
      if (!focusIds || focusIds.size > 1)
        return
      const markerId = focusIds.values().next().value!
      return mapStateStore.currentMarkerIdMap.get(markerId)
    }
  })

  const hover = computed(() => {
    if (!hasHover(MARKER_INTERACTION_KEY))
      return undefined
    const hoverIds = mapStateStore.interaction.hoverElements.get(MARKER_INTERACTION_KEY) as (Set<number> | undefined)
    if (!hoverIds || hoverIds.size > 1)
      return
    const markerId = hoverIds.values().next().value!
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
        target: [x + FLY_OFFSET[0], y + FLY_OFFSET[1]],
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

  watch(() => [focus.value, mapStateStore.interaction.isPopoverOnHover] as const, ([currentFocus, isPopoverOnHover]) => {
    if (!currentFocus) {
      !isPopoverOnHover && mapStateStore.setTempMarkers('focus', [])
      return
    }
    cachedMarkerId.value = currentFocus.id
    !isPopoverOnHover && mapStateStore.setTempMarkers('focus', [currentFocus])
  })

  return {
    isSnapshot,
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
