import type { EventHook } from '@vueuse/core'
import { useMap } from './../hooks'

const collimatorVisible = ref(false)
/** 是否为编辑模式 */
const collimatorEditMode = ref(false)
const confirmHook = createEventHook<API.Coordinate2D>()
const cancelHook = createEventHook<void>()
const openHook = createEventHook<API.Coordinate2D | undefined>()

/** 该 hook 用于控制点位坐标瞄具 */
export const useMarkerCollimator = () => {
  const { map } = useMap()

  const scopedConfirmFn = new Set<(coord: API.Coordinate2D) => void>()
  const scopedCancelFn = new Set<() => void>()
  const scopedOpenFn = new Set<(coord?: API.Coordinate2D) => void>()

  const handleCallbackOn = <A, T extends ((arg: A) => void)>(set: Set<T>, hook: EventHook<A>) => (cb: T) => {
    set.add(cb)
    hook.on(cb)
  }

  const hook = readonly({
    confirm: handleCallbackOn(scopedConfirmFn, confirmHook),
    cancel: handleCallbackOn(scopedCancelFn, cancelHook),
    open: handleCallbackOn(scopedOpenFn, openHook),
  })

  const target = computed(() => map.value ? map.value.unprojectCoord(map.value.mainViewState.target) : [0, 0])

  const showCollimator = (coord?: API.Coordinate2D) => {
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
    scopedOpenFn.forEach(fn => openHook.off(fn))
  })

  return {
    collimatorVisible,
    collimatorEditMode,
    target,
    hook,
    confirm,
    cancel,
    showCollimator,
  }
}
