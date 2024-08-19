import { Observable, filter, finalize, fromEvent, map, switchMap, takeUntil } from 'rxjs'
import { useSubscription } from '@vueuse/rxjs'
import type { PickingInfo } from '@deck.gl/core'
import KDBush from 'kdbush'
import { useTweakWindow } from '.'
import { useAccessStore, useMapStateStore, usePreferenceStore, useShortcutStore } from '@/stores'
import { genshinMapCanvasKey } from '@/pages/pageMapV2/shared'
import { useBanner } from '@/hooks'
import type { GSMapState } from '@/stores/types/genshin-map-state'

interface MultiSelectHookOptions {
  /** 多选窗口标题 */
  windowName: string
}

export const useMultiSelect = (options: MultiSelectHookOptions) => {
  const {
    windowName,
  } = options

  const finalizeHook = createEventHook<void>()

  const accessStore = useAccessStore()
  const mapStateStore = useMapStateStore()
  const shortcutStore = useShortcutStore()
  const preferenceStore = usePreferenceStore()

  const canvasRef = inject(genshinMapCanvasKey) as Ref<HTMLCanvasElement>
  const { width, height } = useElementSize(canvasRef)

  const { currentHeight: bannerHeight } = useBanner()

  // ==================== 多选点位 ====================
  const { pauseFocus, resumeFocus, isFocus, setFocus, removeFocus } = mapStateStore

  const pauseFocusMarker = () => pauseFocus('marker')

  const resumeFocusMarker = () => resumeFocus('marker')

  const setMultiSelecte = (set: Set<number>) => setFocus<number>('marker', set)

  const removeMultiSelecte = () => removeFocus('marker')

  const markerList = computed(() => mapStateStore.currentLayerMarkers.filter(marker => isFocus('marker', marker.id)))

  const currentSelectedIds = computed(() => mapStateStore.focusElements.get('marker') as Set<number> | undefined)

  const {
    isProcessing,
    update: setMission,
    clear: clearMission,
  } = mapStateStore.subscribeMission('markerMultiSelect', () => false)

  // ==================== 界面控制 ====================
  const rect = ref<{
    start?: number[]
    end?: number[]
  }>()

  const shape = computed(() => {
    if (!rect.value?.start || !rect.value.end)
      return
    const { start: [x1, y1], end: [x2, y2] } = rect.value
    const xmin = Math.min(x1, x2)
    const xmax = Math.max(x1, x2)
    const ymin = Math.min(y1, y2)
    const ymax = Math.max(y1, y2)
    return {
      xmin,
      xmax,
      ymin,
      ymax,
      width: xmax - xmin,
      height: ymax - ymin,
    }
  })

  // ==================== 交互事件 ====================
  const pointerup = fromEvent<PointerEvent>(window, 'pointerup')

  const drag = new Observable<[PickingInfo, MouseEvent | PointerEvent]>((observer) => {
    const handler = (info: PickingInfo, ev: { srcEvent: MouseEvent | TouchEvent | PointerEvent }) => {
      if (ev.srcEvent instanceof TouchEvent)
        return
      observer.next([info, ev.srcEvent])
    }
    mapStateStore.event.on('drag', handler)
    return () => {
      mapStateStore.event.off('drag', handler)
    }
  })

  const dragStart = new Observable<[PickingInfo, MouseEvent | PointerEvent]>((observer) => {
    const handler = (info: PickingInfo, ev: { srcEvent: MouseEvent | TouchEvent | PointerEvent }) => {
      if (ev.srcEvent instanceof TouchEvent)
        return
      observer.next([info, ev.srcEvent])
    }
    mapStateStore.event.on('dragStart', handler)
    return () => {
      mapStateStore.event.off('dragStart', handler)
    }
  })

  // ==================== 框选实现 ====================
  const finalizeMission = () => {
    resumeFocusMarker()
    removeMultiSelecte()
    clearMission()
    mapStateStore.setCursor()
    mapStateStore.setViewPortLocked(false)
    mapStateStore.setIsPopoverOnHover(false)
    mapStateStore.setCursor()
    mapStateStore.setTempMarkers('markerMultiSelect', [])
    rect.value = undefined
    finalizeHook.trigger()
  }

  const { id, openWindow, closeWindow } = useTweakWindow(windowName, () => {
    finalizeMission()
    return true
  })

  shortcutStore.useKeys(
    computed(() => preferenceStore.preference['app.shortcutKey.multiselectMarker']),
    () => {
      if (isProcessing.value)
        return
      setMission(true)
      openWindow()
    },
  )

  useSubscription(dragStart.pipe(
    filter(([info, ev]) => {
      return [
        accessStore.get('MARKER_BATCH_EDIT'),
        isProcessing.value,
        info.coordinate !== undefined,
        ev.ctrlKey,
      ].every(condition => condition)
    }),

    switchMap(([startInfo, startEvent]) => {
      resumeFocusMarker()
      mapStateStore.setCursor('crosshair')
      mapStateStore.setIsPopoverOnHover(true)
      mapStateStore.setViewPortLocked(true)
      rect.value = {
        start: [startEvent.clientX, startEvent.clientY - bannerHeight.value],
      }

      const [startX, startY] = startInfo.coordinate!
      const { currentLayerMarkers } = mapStateStore

      /** 构造查询树 */
      const tree = new KDBush(currentLayerMarkers.length)
      currentLayerMarkers.forEach(({ render: { position: [x, y] } }) => {
        tree.add(x, y)
      })
      tree.finish()

      /** 缓存的旧数据，用于选择逻辑处理 */
      const oldIds = [...currentSelectedIds.value ?? []]
      const oldIdsSet = new Set(oldIds)

      /** alt 按下时为取消选择模式 */
      const isRemoveMode = startEvent.altKey

      return drag.pipe(
        filter(([info]) => info.coordinate !== undefined),

        map(([moveInfo, moveEvent]) => {
          rect.value!.end = [moveEvent.clientX, moveEvent.clientY - bannerHeight.value]

          const [moveX, moveY] = moveInfo.coordinate!

          const [xmin, xmax] = startX <= moveX ? [startX, moveX] : [moveX, startX]
          const [ymin, ymax] = startY <= moveY ? [startY, moveY] : [moveY, startY]

          /** 实际操作的数据 */
          const ids = new Set(oldIds)

          const operate = isRemoveMode
            ? ({ id }: GSMapState.MarkerWithRenderConfig) => {
                ids.delete(id!)
              }
            : ({ id }: GSMapState.MarkerWithRenderConfig) => {
                !oldIdsSet.has(id!) && ids.add(id!)
              }

          tree.range(xmin, ymin, xmax, ymax).forEach((index) => {
            const marker = currentLayerMarkers[index]
            operate(marker)
          })

          setMultiSelecte(ids)
        }),

        takeUntil(pointerup),

        // 注意！这里不是直接恢复初始状态，而是恢复到更新选择矩形之前的状态。
        // 只有当多选点位弹出的操作窗口关闭后才恢复到初始状态。
        finalize(() => {
          pauseFocusMarker()
          mapStateStore.setCursor()
          mapStateStore.setViewPortLocked(false)
          mapStateStore.setTempMarkers('markerMultiSelect', markerList.value)
          rect.value = undefined
          openWindow()
        }),
      )
    }),
  ).subscribe())

  onUnmounted(finalizeMission)

  return {
    id,
    width,
    height,
    shape,
    currentSelectedIds,
    markerList,
    isProcessing,

    finalizeMission,
    closeWindow,
    onFinalize: finalizeHook.on,
  }
}
