import { fromEvent, map } from 'rxjs'
import type { ActionPanelTypes } from '../types'

export class PanelContext implements ActionPanelTypes.Context {
  readonly dragHookId = [...crypto.getRandomValues(new Uint8Array(4))].map(num => num.toString(16).padStart(2, '0')).join('')

  protected actionPanels: Ref<Record<string, ActionPanelTypes.Info>> = ref({})

  protected topOrder = computed(() => {
    const panels = this.actionPanels.value
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
    const panel = this.actionPanels.value[id]
    if (!panel)
      return false
    return panel.order === this.topOrder.value
  }

  getActionPanels = () => this.actionPanels.value

  setActionPanels = (panels: Record<string, ActionPanelTypes.Info>) => {
    this.actionPanels.value = panels
  }

  topping = (id: string) => {
    const panels = this.actionPanels.value

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
    const panels = this.actionPanels.value

    const target = panels[id]
    if (!target)
      return

    target.translate = pos
  }
}
