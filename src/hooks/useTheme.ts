const isDark = useDark({
  storageKey: '__ys_theme_schema',
})

export const useTheme = () => {
  const toggle = () => {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
