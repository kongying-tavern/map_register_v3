const visible = ref(true)

/** 该 hook 用于控制交互层的可见性 */
export const useInteractionLayer = () => {
  return { visible }
}
