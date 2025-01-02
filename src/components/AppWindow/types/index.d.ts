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
    /**
     * 打开前的回调，返回非 true 值会阻止打开
     */
    beforeOpen?: () => boolean
    /**
     * 关闭前的回调，返回非 true 值会阻止关闭
     */
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

    /** 通过 id 获取窗口信息 */
    getWindow(id: string): MapWindow.Info | undefined

    /** 获取所有窗口信息 */
    getWindows(): Map<string, MapWindow.Info>

    /** 清除所有窗口 */
    clearWindow(): void

    /** 置顶指定 id 的面板 */
    topping(id: string): void

    /** 移动指定的面板 */
    move(id: string, pos: Coordinate): void

    /** 打开窗口，如果已存在对应 id 的面板则跳过操作 */
    openWindow(params: MapWindow.WindowOpenParams): void

    /** 更新窗口信息，除了 id */
    updateWindow(id: string, params: Partial<Omit<MapWindow.WindowOpenParams, 'id'>>): void

    /** 关闭窗口 */
    closeWindow(id: string): void

    /** 最小化窗口 */
    minusWindow(id: string): void

    /** 移动窗口 */
    move(id: string, pos: { x: number; y: number }): void

    /** 调整窗口尺寸 */
    resize(id: string, rect: MapWindow.ResizeProps,): void

    /** 优化窗口位置，使其返回可见区域 */
    optimizeWindowPosition(box?: ResizeObserverSize): void
  }

  interface WindowDragHookOptions {
    context: MapWindow.Context
  }
}
