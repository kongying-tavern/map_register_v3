const selection = ref<API.ItemVo[]>([])

export const useItemTable = () => {
  const handleSelectionChange = (items: API.ItemVo[]) => {
    selection.value = items
  }

  return { selection, handleSelectionChange }
}
