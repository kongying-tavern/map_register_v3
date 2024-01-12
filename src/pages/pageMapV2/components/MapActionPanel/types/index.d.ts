import type { Observable } from 'rxjs'

export declare namespace ActionPanelTypes {
  interface Coordinate {
    x: number
    y: number
  }

  interface Info {
    name: string
    translate: Coordinate
    order: number
  }

  interface Context {
    dragHookId: string

    pointerdown: Observable<{ srcEvent: PointerEvent; target: HTMLElementl; panelId: string } | undefined>

    pointermove: Observable<PointerEvent>

    pointerup: Observable<PointerEvent>

    /** 面板是否已置顶 */
    isTop(id: string): boolean

    /** 置顶指定 id 的面板 */
    topping(id: string): void

    /** 移动指定的面板 */
    move(id: string, pos: Coordinate): void
  }

  interface PanelDragHookOptions {
    context: ActionPanelTypes.Context
  }
}
