/** 用于管理依赖原生系统的异步资源状态 */
export const useResourceStatus = () => {
  const status = ref({
    fonts: document.fonts.status === 'loaded',
  })

  useEventListener(document.fonts, 'loading', () => {
    status.value.fonts = false
  })

  useEventListener(document.fonts, 'loadingdone', () => {
    status.value.fonts = true
  })

  return {
    status,
  }
}
