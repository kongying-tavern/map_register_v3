import { content, visible } from './bannerContext'

/** 顶部 banner，后续可以充当通知栏 */
export const useBanner = () => {
  const show = (msg?: string) => {
    if (!msg)
      return
    content.value = msg
    visible.value = true
  }

  const hide = () => {
    visible.value = false
    content.value = ''
  }

  tryOnUnmounted(hide)

  return { show, hide }
}
