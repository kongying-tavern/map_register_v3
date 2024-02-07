export const userLogoutHook = createEventHook<void>()

/** 用户注销时的 hook */
export const onUserLogout = (fn: () => void) => {
  tryOnUnmounted(() => {
    userLogoutHook.off(fn)
  })
  return userLogoutHook.on(fn)
}
