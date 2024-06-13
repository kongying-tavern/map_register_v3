import { fromEvent, map } from 'rxjs'
import { clamp } from 'lodash'
import type { MapWindow } from '../types'

export class WindowContext implements MapWindow.Context {
  readonly HEADER_HEIGHT = 30
  readonly MIN_WIDTH = 300
  readonly MIN_HEIGHT = 300

  readonly dragHookId = [...crypto.getRandomValues(new Uint8Array(4))].map(num => num.toString(16).padStart(2, '0')).join('')

  protected panels: Ref<Record<string, MapWindow.Info>> = ref({})

  protected cachedInfos: Record<string, MapWindow.Info> = {}

  closeHook = createEventHook<string>()

  protected topOrder = computed(() => {
    const panels = this.panels.value
    let order = 0
    for (const key in panels)
      order = Math.max(order, panels[key].order)
    return order
  })

  pointerdown = fromEvent<PointerEvent>(window, 'pointerdown').pipe(
    map((ev) => {
      const result = ev.composedPath().find((target) => {
        if (!(target instanceof HTMLElement))
          return false
        return target.dataset[this.dragHookId] !== undefined
      }) as HTMLElement | undefined
      if (!result)
        return
      return {
        srcEvent: ev,
        target: result,
        panelId: result.dataset[this.dragHookId]!,
      }
    }),
  )

  pointermove = fromEvent<PointerEvent>(window, 'pointermove')

  pointerup = fromEvent<PointerEvent>(window, 'pointerup')

  isTop = (id: string) => {
    const panel = this.panels.value[id]
    if (!panel)
      return false
    return panel.order === this.topOrder.value
  }

  getWindow = (id: string) => {
    return this.panels.value[id] as MapWindow.Info | undefined
  }

  getWindows = () => {
    return this.panels.value
  }

  setWindows = (panels: Record<string, MapWindow.Info>) => {
    this.panels.value = panels
  }

  openWindow = (params: MapWindow.WindowOpenParams) => {
    if (this.panels.value[params.id])
      return

    const {
      minWidth = this.MIN_WIDTH,
      minHeight = this.MIN_HEIGHT,
      x: initX = 0,
      y: initY = 0,
    } = params

    const {
      translate: { x = initX, y = initY } = {},
      size,
    } = this.cachedInfos[params.id] ?? {}

    const info = {
      ...params,
      translate: { x, y },
      size: size ?? { width: minWidth, height: minHeight },
      order: this.topOrder.value + 1,
      ref: null,
    }

    this.panels.value[params.id] = info
    this.cachedInfos[params.id] = info
    this.optimizeWindowPosition()
  }

  closeWindow = (id: string) => {
    const panels = this.panels.value
    const panel = panels[id]
    if (!panel)
      return

    const closable = panel.beforeClose ? panel.beforeClose() : true
    if (!closable)
      return

    const { order } = panel
    for (const key in panels) {
      if (panels[key].order <= order)
        continue
      panels[key].order -= 1
    }
    delete this.panels.value[id]
    // TODO 后续可能需要为窗口添加过渡效果，需要确保过渡结束以后才触发 close hook
    this.closeHook.trigger(id)
  }

  topping = (id: string) => {
    const panels = this.panels.value

    const target = panels[id]
    if (!target || target.order === this.topOrder.value)
      return

    let moveOrder = 0
    for (const key in panels) {
      const panel = panels[key]
      if (panel.order <= target.order)
        continue
      panel.order -= 1
      moveOrder += 1
    }

    target.order += moveOrder
  }

  move = (id: string, pos: { x: number; y: number }) => {
    const panels = this.panels.value

    const target = panels[id]
    if (!target)
      return

    target.translate = pos
    this.cachedInfos[id].translate = pos
  }

  resize = (
    id: string,
    rect: MapWindow.ResizeProps,
  ) => {
    if (!this.cachedInfos[id])
      return

    const panels = this.panels.value
    const target = panels[id]
    if (!target)
      return

    const {
      translate,
      size,
      minWidth = this.MIN_WIDTH,
      minHeight = this.MIN_HEIGHT,
    } = target

    const {
      x = translate.x,
      y = translate.y,
      width = size.width,
      height = size.height,
    } = rect

    const resizeWidth = Math.max(width, minWidth)
    const resizeheight = Math.max(height, minHeight)

    target.translate = {
      x: resizeWidth === size.width ? translate.x : x,
      y: resizeheight === size.height ? translate.y : y,
    }

    target.size = {
      width: resizeWidth,
      height: resizeheight,
    }

    this.cachedInfos[id].translate = target.translate
    this.cachedInfos[id].size = target.size
  }

  /** 优化窗口位置，使其返回可见区域 */
  optimizeWindowPosition = (box?: ResizeObserverSize) => {
    const panels = this.panels.value

    const { clientWidth, clientHeight } = document.body

    const { inlineSize = clientWidth, blockSize = clientHeight } = box ?? {}
    for (const key in panels) {
      const info = panels[key]
      const { width, height } = info.size
      const { x, y } = info.translate
      info.translate = {
        x: clamp(x, 0, Math.max(0, inlineSize - width)),
        y: clamp(y, 0, Math.max(0, blockSize - height - this.HEADER_HEIGHT)),
      }
    }
  }
}

export const context = new WindowContext()
