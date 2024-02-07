const sharedContext = {
  content: ref(''),
  visible: ref(false),
  height: 32,
}

const show = (msg?: string) => {
  if (!msg)
    return
  sharedContext.content.value = msg
  sharedContext.visible.value = true
}

const hide = () => {
  sharedContext.visible.value = false
  sharedContext.content.value = ''
}

/** 顶部 banner，后续可以充当通知栏 */
export const useBanner = () => {
  return {
    ...sharedContext,
    show,
    hide,
  }
}
