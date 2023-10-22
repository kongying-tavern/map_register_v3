import { visible as bannerVisible, content } from './bannerContext'

/** 顶部 banner，后续可以充当通知栏 */
export const useBanner = () => {
  const visible = computed({
    get: () => bannerVisible.value,
    set: (v) => {
      bannerVisible.value = v
    },
  })

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

  return { visible, show, hide }
}
