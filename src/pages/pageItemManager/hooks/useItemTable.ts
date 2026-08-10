import type { ItemVo } from '@/api/alova/globals'

const selection = ref<ItemVo[]>([])

export const useItemTable = () => {
  const handleSelectionChange = (items: ItemVo[]) => {
    selection.value = items
  }

  return { selection, handleSelectionChange }
}
