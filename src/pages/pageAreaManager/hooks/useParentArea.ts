export const useParentArea = () => {
  const parentPath = ref<API.AreaVo[]>([])

  const parent = computed(() => parentPath.value.at(-1))

  const goto = (newParent?: API.AreaVo) => {
    if (!newParent) {
      parentPath.value = []
      return
    }
    const fineIndex = parentPath.value.findIndex(fintParent => fintParent.id === newParent.id)
    if (fineIndex > -1) {
      parentPath.value = parentPath.value.slice(0, fineIndex + 1)
      return
    }
    parentPath.value.push(newParent)
  }

  return { parentPath, parent, goto }
}
