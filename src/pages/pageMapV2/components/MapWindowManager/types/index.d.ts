import type { Observable } from 'rxjs'

export declare namespace MapWindow {
  interface Coordinate {
    x: number
    y: number
  }

  interface Size {
    width: number
    height: number
  }

  interface WindowOpenParams {
    id: string
    name: string
    beforeClose?: () => boolean
  }

  interface Info extends WindowOpenParams {
    translate: MapWindow.Coordinate
    size: MapWindow.Size
    order: number
    ref: HTMLElement | null
  }

  interface Context {
    /** 拖动识别 id，固定值 */
    dragHookId: string

    /** 指针按下的事件源 */
    pointerdown: Observable<{ srcEvent: PointerEvent; target: HTMLElementl; panelId: string } | undefined>

    /** 指针移动的事件源 */
    pointermove: Observable<PointerEvent>

    /** 指针抬起的事件源 */
    pointerup: Observable<PointerEvent>

    /** 窗口是否已置顶 */
    isTop(id: string): boolean

    /** 置顶指定 id 的面板 */
    topping(id: string): void

    /** 移动指定的面板 */
    move(id: string, pos: Coordinate): void

    /** 打开窗口，如果已存在对应 id 的面板则跳过操作 */
    openWindow(params: MapWindow.WindowOpenParams): void

    /** 关闭窗口 */
    closeWindow(id: string): void
  }

  interface WindowDragHookOptions {
    context: MapWindow.Context
  }
}
