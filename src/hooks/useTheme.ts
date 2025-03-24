import { transitionToggleSchema } from '@/utils'

const isDark = useDark({
  storageKey: '__ys_theme_schema',
})

export const useTheme = () => {
  const toggle = () => {
    transitionToggleSchema(innerWidth / 2, innerHeight / 2, () => {
      isDark.value = !isDark.value
    })
  }

  return { isDark, toggle }
}
