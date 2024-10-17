export declare namespace MapWindow {
  interface Coordinate {
    x: number
    y: number
  }

  interface Size {
    width: number
    height: number
  }

  type ResizeProps = Partial<Coordinate & Size>

  interface WindowOpenParams {
    id: string
    name: string
    /** @default 300 */
    minWidth?: number
    /** @default 300 */
    minHeight?: number
    /** @default 0 */
    x?: number
    /** @default 0 */
    y?: number
    beforeClose?: () => boolean
  }

  interface Info extends WindowOpenParams {
    translate: MapWindow.Coordinate
    size: MapWindow.Size
    order: number
    ref: HTMLElement | null
    isMinus?: boolean
  }

  interface Context {
    /** 拖动识别 id，固定值 */
    dragHookId: string

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
