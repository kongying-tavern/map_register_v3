import type { FooterButton } from './dialogContext'
import { buttons, closeResolver, resolveResult, visible } from './dialogContext'

/** 弹窗控制器，由子组件调用 */
export class DialogController {
  static close = <T>(payload?: T, ignoreResult = false) => {
    visible.value = false
    !ignoreResult && resolveResult(payload)
  }

  /** 等待弹窗关闭后获取数据 */
  static afterClosed = <T>() => new Promise<T | undefined>((resolve) => {
    closeResolver.value = resolve
  })

  /** 在弹窗底部注册一个按钮 */
  static registerBtn = (role: string, btn: FooterButton) => {
    buttons.value.set(role, btn)
  }

  /** 考虑到可能需要更新已有按钮的状态，就做了这个功能 */
  static updateBtnProps = (role: string, btn: Partial<FooterButton>) => {
    const button = buttons.value.get(role)
    if (!button)
      return
    const { props = {}, text = button.text, onClick = button.onClick } = btn
    button.props = {
      ...button.props,
      ...props,
    }
    button.text = text
    button.onClick = onClick
  }

  /** 注销已注册的按钮 */
  static unregisterBtn = (role: string) => {
    buttons.value.delete(role)
  }
}
