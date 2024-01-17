import { fromEvent, map } from 'rxjs'
import type { MapWindow } from '../types'

export class WindowContext implements MapWindow.Context {
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

  getWindows = () => {
    return this.panels.value
  }

  setWindows = (panels: Record<string, MapWindow.Info>) => {
    this.panels.value = panels
  }

  openWindow = (params: MapWindow.WindowOpenParams) => {
    if (this.panels.value[params.id])
      return
    const cacheInfo = this.cachedInfos[params.id]
    const info = {
      ...params,
      translate: cacheInfo?.translate ?? { x: 0, y: 0 },
      size: cacheInfo?.size ?? { width: 400, height: 600 },
      order: this.topOrder.value + 1,
      ref: null,
    }
    this.panels.value[params.id] = info
    this.cachedInfos[params.id] = info
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
}

export const context = new WindowContext()
