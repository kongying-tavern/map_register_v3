import { context } from './context'

/** 弹窗控制器，由子组件调用 */
export class GlobalDialogController {
  static close = <T>(payload?: T, ignoreResult = false) => {
    context.visible.value = false
    !ignoreResult && context.resolveResult(payload)
  }

  /** 等待弹窗关闭后获取数据 */
  static afterClosed = <T = undefined>() => new Promise<T>((resolve) => {
    context.closeResolver.value = resolve as (value: unknown) => void
  })
}
