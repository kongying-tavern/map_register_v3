import { ItemDetailEditor } from '../components'
import { useGlobalDialog, useItemList } from '@/hooks'
import { useRowEdit } from '@/hooks/useTableManipulation'

export interface ItemEditHookOptions {
  onItemDetailEditSuccess?: () => void
}

export const useItemEdit = (options: ItemEditHookOptions) => {
  const { onItemDetailEditSuccess } = options

  const { itemList } = useItemList()

  const editOptions = useRowEdit({
    rowList: itemList,
    saveHandler: async () => {
      /** @TODO 保留行内编辑能力 */
    },
  })

  const { DialogService } = useGlobalDialog()

  const openItemDetailEditorDialog = async (index: number) => {
    await DialogService
      .config({ title: '编辑物品详情', width: '700px', top: '20px' })
      .props({
        item: itemList.value[index],
        type: 'editor',
      })
      .listeners({
        success: () => onItemDetailEditSuccess?.(),
      })
      .open(ItemDetailEditor)
      .afterClosed<boolean>()
  }

  return { ...editOptions, openItemDetailEditorDialog }
}
