class BannerContext {
  content = ref('')

  visible = ref(false)

  height = ref(32)

  currentHeight = computed(() => {
    if (!this.visible.value)
      return 0
    return this.height.value
  })

  show = (msg?: string) => {
    if (!msg)
      return
    this.content.value = msg
    this.visible.value = true
  }

  close = () => {
    this.visible.value = false
    this.content.value = ''
  }

  hide = () => {
    this.visible.value = false
  }
}

let context: BannerContext

/** 顶部 banner，后续可以充当通知栏 */
export const useBanner = () => {
  if (!context)
    context = new BannerContext()

  return context
}
