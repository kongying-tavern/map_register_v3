import { usePreferenceStore } from '@/stores'

export const useMapSiderMenu = (target: Ref<HTMLElement>) => {
  const preferenceStore = usePreferenceStore()

  const collapse = computed({
    get: () => Boolean(preferenceStore.preference['mapSiderMenu.state.collapse']),
    set: (v) => {
      preferenceStore.preference['mapSiderMenu.state.collapse'] = v
    },
  })

  whenever(() => preferenceStore.preference['mapSiderMenu.state.collapse'], () => target.value?.focus())

  useEventListener<KeyboardEvent>(target, 'keydown', (ev) => {
    if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement)
      return
    if (ev.code === 'Backquote')
      collapse.value = !collapse.value
  })

  return { collapse }
}
