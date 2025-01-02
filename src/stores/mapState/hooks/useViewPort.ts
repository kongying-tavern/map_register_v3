export const useViewPort = () => {
  const isViewPortLocked = ref(false)

  /** 设置是否锁定视口变化 */
  const setViewPortLocked = (v: boolean) => {
    isViewPortLocked.value = v
  }

  return {
    isViewPortLocked: isViewPortLocked as Readonly<Ref<boolean>>,
    setViewPortLocked,
  }
}
