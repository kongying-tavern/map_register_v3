import { filter, finalize, map, switchMap, takeUntil } from 'rxjs'
import { useSubscription } from '@vueuse/rxjs'
import type { WindowContext } from '../core'
import { genshinMapCanvasKey } from '@/pages/pageMapV2/shared'

export const useWindowDrag = (context: WindowContext) => {
  const { pointerdown, pointermove, pointerup } = context

  const mapCanvas = inject(genshinMapCanvasKey, ref())

  const optimizeWindowPosition = () => {
    if (!mapCanvas.value)
      return
    const { width, height } = mapCanvas.value.getBoundingClientRect()
    context.optimizeWindowPosition({ inlineSize: width, blockSize: height })
  }

  useSubscription(pointerdown.pipe(
    filter((result) => {
      return result !== undefined
    }),
    map((result) => {
      context.topping(result!.panelId)
    }),
  ).subscribe())

  useSubscription(pointerdown.pipe(
    filter((result) => {
      if (!result)
        return false
      if (!(result.srcEvent.target instanceof HTMLElement))
        return false
      return result.srcEvent.target.dataset.draggable === 'true'
    }),

    map((result) => {
      const { target, srcEvent } = result!
      const panelId = target!.dataset[context.dragHookId]!

      const style = getComputedStyle(target!)
      const translate = {
        x: Number(style.getPropertyValue('--tx')),
        y: Number(style.getPropertyValue('--ty')),
      }

      const startPosition = {
        x: srcEvent.x,
        y: srcEvent.y,
      }

      return {
        translate,
        startPosition,
        panelId,
      }
    }),

    switchMap(({ panelId, translate, startPosition }) => {
      return pointermove.pipe(
        map(({ x, y }) => {
          context.move(panelId, {
            x: translate.x + x - startPosition.x,
            y: translate.y + y - startPosition.y,
          })
        }),

        takeUntil(pointerup),

        finalize(() => {
          if (!mapCanvas.value)
            return
          const { width, height } = mapCanvas.value
          context.optimizeWindowPosition({ inlineSize: width, blockSize: height })
        }),
      )
    }),
  ).subscribe())

  useResizeObserver(mapCanvas, ([entry]) => {
    const { contentBoxSize: [boxSize] = [] } = entry
    context.optimizeWindowPosition(boxSize)
  })

  return {
    optimizeWindowPosition,
  }
}
