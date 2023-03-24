/** 快捷键 hook */
export const useShortcutKeys = () => {
  const route = useRoute()

  useEventListener('keydown', (ev) => {
    if (route.path !== '/map')
      return
    // console.log('[press]', ev)
  })
}
