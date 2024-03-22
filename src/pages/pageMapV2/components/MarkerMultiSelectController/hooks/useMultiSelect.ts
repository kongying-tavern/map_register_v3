import { Observable, filter, finalize, fromEvent, map, switchMap, takeUntil } from 'rxjs'
import { useSubscription } from '@vueuse/rxjs'
import type { PickingInfo } from '@deck.gl/core/typed'
import { useAccessStore, useMapStateStore } from '@/stores'
import { genshinMapCanvasKey } from '@/pages/pageMapV2/shared'
import { useBanner } from '@/hooks'
import { mapWindowContext } from '@/pages/pageMapV2/components'

interface MultiSelectHookOptions {
  /** 多选窗口标题 */
  windowName: string
}

export const useMultiSelect = (options: MultiSelectHookOptions) => {
  const {
    windowName,
  } = options

  const id = crypto.randomUUID()

  const accessStore = useAccessStore()
  const mapStateStore = useMapStateStore()

  const canvasRef = inject(genshinMapCanvasKey) as Ref<HTMLCanvasElement>
  const { width, height } = useElementSize(canvasRef)

  const { currentHeight: bannerHeight } = useBanner()

  // ==================== 多选点位 ====================
  const {
    data: currentSelectedIds,
    update: setMultiSelecte,
  } = mapStateStore.subscribeInteractionInfo('focus', 'multipleMarkers')

  const {
    pause: pauseFocusMarker,
    resume: resumeFocusMarker,
  } = mapStateStore.subscribeInteractionInfo('focus', 'defaultMarker')

  const {
    isEnable,
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
    setMultiSelecte(null)
    clearMission()
    mapStateStore.setCursor()
    mapStateStore.setViewPortLocked(false)
    mapStateStore.setIsPopoverOnHover(false)
    mapStateStore.setCursor()
    rect.value = undefined
  }

  const closeWindow = () => {
    mapWindowContext.closeWindow(id)
  }

  const initMultiSelect = (ids: Set<number>) => {
    if (!ids.size) {
      closeWindow()
      return
    }
    mapWindowContext.openWindow({
      id,
      name: windowName,
    })
  }

  useSubscription(dragStart.pipe(
    filter(([info, ev]) => {
      return [
        accessStore.get('MARKER_BATCH_EDIT'),
        ev.ctrlKey, // 只在按住 ctrl 时可以开启多选
        isEnable.value,
        info.coordinate !== undefined,
      ].every(condition => condition)
    }),

    switchMap(([startInfo, startEvent]) => {
      pauseFocusMarker()
      setMission(true)
      mapStateStore.setCursor('crosshair')
      mapStateStore.setIsPopoverOnHover(true)
      mapStateStore.setViewPortLocked(true)
      rect.value = {
        start: [startEvent.clientX, startEvent.clientY - bannerHeight.value],
      }

      const [startX, startY] = startInfo.coordinate!
      const { currentLayerMarkers } = mapStateStore

      const ids = new Set(currentSelectedIds.value)
      const oldIds = new Set(currentSelectedIds.value)

      /** alt 按下时为取消选择模式 */
      const operate = startEvent.altKey
        ? (id: number, overSelect: boolean) => {
            if (overSelect)
              return
            ids.delete(id)
          }
        : (id: number, overSelect: boolean) => {
            if (oldIds.has(id))
              return
            if (overSelect) {
              ids.delete(id)
              return
            }
            ids.add(id)
          }

      return drag.pipe(
        filter(([info]) => info.coordinate !== undefined),

        map(([moveInfo, moveEvent]) => {
          rect.value!.end = [moveEvent.clientX, moveEvent.clientY - bannerHeight.value]

          const [moveX, moveY] = moveInfo.coordinate!

          // TODO 性能优化 O(4n)
          currentLayerMarkers.forEach(({ id, render }) => {
            const [x, y] = render.position
            operate(
              id!,
              x < Math.min(startX, moveX)
              || x > Math.max(startX, moveX)
              || y < Math.min(startY, moveY)
              || y > Math.max(startY, moveY),
            )
          })

          setMultiSelecte(ids)
        }),

        takeUntil(pointerup),

        // 注意！这里不是直接恢复初始状态，而是恢复到更新选择矩形之前的状态。
        // 只有当多选点位弹出的操作窗口关闭后才恢复到初始状态。
        finalize(() => {
          mapStateStore.setCursor()
          mapStateStore.setViewPortLocked(false)
          rect.value = undefined
          initMultiSelect(ids)
        }),
      )
    }),
  ).subscribe())

  return {
    id,
    width,
    height,
    shape,

    finalizeMission,
    closeWindow,
  }
}
