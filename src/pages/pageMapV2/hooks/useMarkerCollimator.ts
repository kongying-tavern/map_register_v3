import type { Coordinate2D } from './../core'
import { useMap } from './../hooks'

const collimatorVisible = ref(false)
const confirmHook = createEventHook<Coordinate2D>()
const cancelHook = createEventHook<void>()
const openHook = createEventHook<Coordinate2D | undefined>()

/** 该 hook 用于控制点位坐标瞄具 */
export const useMarkerCollimator = () => {
  const { map } = useMap()

  const scopedConfirmFn = new Set<(coord: Coordinate2D) => void>()
  const scopedCancelFn = new Set<() => void>()
  const scopedOpenFn = new Set<(coord: Coordinate2D) => void>()

  const onConfirm = (fn: (coord: Coordinate2D) => void) => {
    scopedConfirmFn.add(fn)
    confirmHook.on(fn)
  }

  const onCancel = (fn: () => void) => {
    scopedCancelFn.add(fn)
    cancelHook.on(fn)
  }

  const onOpen = (fn: (cood?: Coordinate2D) => void) => {
    scopedOpenFn.add(fn)
    openHook.on(fn)
  }

  const hook = readonly({
    confirm: onConfirm,
    cancel: onCancel,
    open: onOpen,
  })

  const target = computed(() => map.value ? map.value.unprojectCoord(map.value.mainViewState.target) : [0, 0])

  const showCollimator = (coord?: Coordinate2D) => {
    if (collimatorVisible.value || !map.value?.baseLayer)
      return
    collimatorVisible.value = true
    openHook.trigger(coord)
  }

  const confirm = () => {
    if (!collimatorVisible.value || !map.value?.baseLayer)
      return
    confirmHook.trigger(map.value.unprojectCoord(map.value.mainViewState.target))
  }

  const cancel = () => {
    if (!collimatorVisible.value || !map.value?.baseLayer)
      return
    cancelHook.trigger()
  }

  onBeforeUnmount(() => {
    scopedConfirmFn.forEach(fn => confirmHook.off(fn))
    scopedCancelFn.forEach(fn => cancelHook.off(fn))
  })

  return {
    collimatorVisible,
    target,
    hook,
    confirm,
    cancel,
    showCollimator,
  }
}
