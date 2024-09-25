import { clamp } from 'lodash'
import type { MapWindow } from '../types'

export class WindowContext implements MapWindow.Context {
  readonly HEADER_HEIGHT = 30
  readonly MIN_WIDTH = 300
  readonly MIN_HEIGHT = 300

  readonly dragHookId = [...crypto.getRandomValues(new Uint8Array(4))].map(num => num.toString(16).padStart(2, '0')).join('')

  protected panels: Ref<Map<string, MapWindow.Info>> = ref(new Map())

  protected cachedInfos: Map<string, MapWindow.Info> = new Map()

  closeHook = createEventHook<string>()

  protected topOrder = computed(() => {
    let order = 0
    this.panels.value.forEach((panel) => {
      order = Math.max(order, panel.order)
    })
    return order
  })

  isTop = (id: string) => {
    const panel = this.panels.value.get(id)
    if (!panel)
      return false
    return panel.order === this.topOrder.value
  }

  getWindow = (id: string) => {
    return this.panels.value.get(id)
  }

  getWindows = () => {
    return this.panels.value
  }

  setWindows = (panels: Map<string, MapWindow.Info>) => {
    this.panels.value = panels
  }

  openWindow = (params: MapWindow.WindowOpenParams) => {
    if (this.panels.value.has(params.id))
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
    } = this.cachedInfos.get(params.id) ?? {}

    const info = {
      ...params,
      translate: { x, y },
      size: size ?? { width: minWidth, height: minHeight },
      order: this.topOrder.value + 1,
      ref: null,
    }

    this.panels.value.set(params.id, info)
    this.cachedInfos.set(params.id, info)
    this.optimizeWindowPosition()
  }

  minusWindow = (id: string) => {
    const panel = this.panels.value.get(id)
    if (!panel)
      return
    panel.isMinus = !panel.isMinus
    this.optimizeWindowPosition()
  }

  closeWindow = (id: string) => {
    const panel = this.panels.value.get(id)
    if (!panel)
      return

    const closable = panel.beforeClose ? panel.beforeClose() : true
    if (!closable)
      return

    const { order } = panel
    this.panels.value.forEach((iPanel) => {
      if (iPanel.order <= order)
        return
      iPanel.order -= 1
    })
    this.panels.value.delete(id)
    // TODO 后续可能需要为窗口添加过渡效果，需要确保过渡结束以后才触发 close hook
    this.closeHook.trigger(id)
  }

  clearWindow = () => {
    this.panels.value.forEach(panel => this.closeWindow(panel.id))
  }

  topping = (id: string) => {
    const target = this.panels.value.get(id)
    if (!target || target.order === this.topOrder.value)
      return

    let moveOrder = 0
    this.panels.value.forEach((panel) => {
      if (panel.order <= target.order)
        return
      panel.order -= 1
      moveOrder += 1
    })

    target.order += moveOrder
  }

  move = (id: string, pos: { x: number; y: number }) => {
    const target = this.panels.value.get(id)
    if (!target)
      return

    target.translate = pos
    const cache = this.cachedInfos.get(id)
    if (!cache)
      return
    cache.translate = pos
  }

  resize = (
    id: string,
    rect: MapWindow.ResizeProps,
  ) => {
    const cache = this.cachedInfos.get(id)
    if (!cache)
      return

    const target = this.panels.value.get(id)
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

    cache.translate = target.translate
    cache.size = target.size
  }

  /** 优化窗口位置，使其返回可见区域 */
  optimizeWindowPosition = (box?: ResizeObserverSize) => {
    const { clientWidth, clientHeight } = document.body

    const { inlineSize = clientWidth, blockSize = clientHeight } = box ?? {}
    this.panels.value.forEach((info) => {
      const { width, height } = info.size
      const { x, y } = info.translate
      info.translate = info.isMinus
        ? {
            x: clamp(x, 0, Math.max(0, inlineSize - this.MIN_WIDTH)),
            y: clamp(y, 0, Math.max(0, blockSize - this.HEADER_HEIGHT)),
          }
        : {
            x: clamp(x, 0, Math.max(0, inlineSize - width)),
            y: clamp(y, 0, Math.max(0, blockSize - height - this.HEADER_HEIGHT)),
          }
    })
  }
}

export const context = new WindowContext()
