import { Observable, filter, finalize, switchMap, takeUntil, tap } from 'rxjs'
import { useSubscription } from '@vueuse/rxjs'
import type { PickingInfo } from '@deck.gl/core'
import KDBush from 'kdbush'
import { useArchiveStore, useMapStateStore, usePreferenceStore, useShortcutStore } from '@/stores'
import { genshinMapCanvasKey } from '@/pages/pageMapV2/shared'
import { globalKeyUp$, globalPointerup$ } from '@/shared'

export const useMapSelect = () => {
  const canvasRef = inject(genshinMapCanvasKey) as Ref<HTMLCanvasElement>
  const { width, height } = useElementSize(canvasRef)

  const rect = ref<{
    start?: number[]
    end?: number[]
  }>({})

  const stroke = ref('transparet')

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

  const archiveStore = useArchiveStore()
  const mapStateStore = useMapStateStore()
  const shortcutStore = useShortcutStore()
  const preferenceStore = usePreferenceStore()

  const { setFocus, removeFocus } = mapStateStore

  const dragstart$ = new Observable<[PickingInfo, MouseEvent | PointerEvent]>((observer) => {
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

  const dragging$ = new Observable<[PickingInfo, MouseEvent | PointerEvent]>((observer) => {
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

  const {
    isEmpty,
    isProcessing,
    update: setMission,
    clear,
  } = mapStateStore.subscribeMission('markerBulkState', () => false)

  useSubscription(shortcutStore.shortcut$.pipe(
    filter(({ value }) => [
      isEmpty.value,
      value === preferenceStore.preference['app.shortcutKey.toggleMarkerState'],
    ].every(Boolean)),

    tap(() => {
      setMission(true)
    }),

    switchMap(() => dragstart$.pipe(
      filter(([_, { buttons }]) => buttons === 1 || buttons === 2),

      tap(([_, startEvent]) => {
        mapStateStore.setCursor('crosshair')
        rect.value.start = [startEvent.clientX, startEvent.clientY]
      }),

      switchMap(([startInfo, startEvent]) => {
        const isRemoveMode = startEvent.buttons === 2

        stroke.value = isRemoveMode ? 'yellow' : '#00FFFD'

        const { currentLayerMarkers } = mapStateStore
        const ids = new Set<number>()

        /** 构造查询树 */
        const tree = new KDBush(currentLayerMarkers.length)
        currentLayerMarkers.forEach(({ render: { position: [x, y] } }) => {
          tree.add(x, y)
        })
        tree.finish()

        const [startX, startY] = startInfo.coordinate!

        return dragging$.pipe(
          filter(([info]) => info.coordinate !== undefined),

          tap(([moveInfo, moveEvent]) => {
            rect.value.end = [moveEvent.clientX, moveEvent.clientY]

            const [moveX, moveY] = moveInfo.coordinate!
            const [xmin, xmax] = startX <= moveX ? [startX, moveX] : [moveX, startX]
            const [ymin, ymax] = startY <= moveY ? [startY, moveY] : [moveY, startY]

            tree.range(xmin, ymin, xmax, ymax).forEach((index) => {
              const marker = currentLayerMarkers[index]
              ids.add(marker.id!)
            })

            setFocus('marker', ids)
          }),

          takeUntil(globalPointerup$),

          finalize(async () => {
            stroke.value = 'transparent'
            rect.value.start = undefined
            rect.value.end = undefined
            if (isRemoveMode)
              ids.forEach(id => archiveStore.currentArchive.body.Data_KYJG.delete(id))
            else
              ids.forEach(id => archiveStore.currentArchive.body.Data_KYJG.add(id))
            ids.clear()
            mapStateStore.setCursor()
            removeFocus('marker')
            await archiveStore.saveArchiveToSlot(archiveStore.currentArchive.slotIndex)
          }),
        )
      }),

      takeUntil(globalKeyUp$),

      finalize(() => {
        clear()
      }),
    )),
  ).subscribe())

  return {
    isProcessing,
    stroke,
    shape,
    width,
    height,
  }
}
