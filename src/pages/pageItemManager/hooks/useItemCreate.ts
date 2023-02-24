import { ItemDetailEditor } from '../components'
import { useGlobalDialog } from '@/hooks'

interface ItemCreateHookOption {
  defaultItemData?: () => API.ItemVo
  onCreateItemSuccess?: () => void
}

export interface ItemCreatorDialogOptions {
  listeners: Record<string, (event: string) => void>
}

export const useItemCreate = (options: ItemCreateHookOption) => {
  const { defaultItemData = () => ({} as API.ItemVo), onCreateItemSuccess } = options

  /** @TODO 暂定默认iconStyle默认样式 */
  const item = computed(() => {
    const i = defaultItemData()
    i.iconStyleType = 0
    return i
  })

  const { DialogService } = useGlobalDialog()

  const openItemCreatorDialog = async () => {
    await DialogService
      .config({ title: '新建物品', width: '700px', top: '20px' })
      .props({
        item: item.value,
        type: 'creator',
      })
      .listeners({
        success: () => onCreateItemSuccess?.(),
      })
      .open(ItemDetailEditor)
      .afterClosed<boolean>()
  }

  return { openItemCreatorDialog }
}
