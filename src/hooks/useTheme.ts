const isDark = useDark({
  storageKey: '__ys_theme_schema',
})

export const useTheme = () => {
  return { isDark }
}
