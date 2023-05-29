export const userLoginHook = createEventHook<void>()

/** 用户登录时的 hook */
export const onUserLogin = (fn: () => void) => {
  tryOnUnmounted(() => {
    userLoginHook.off(fn)
  })
  return userLoginHook.on(fn)
}
