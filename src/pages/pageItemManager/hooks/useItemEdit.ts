import type { Ref } from 'vue'
import { ItemDetailEditor } from '../components'
import { useGlobalDialog } from '@/hooks'
import { useRowEdit } from '@/hooks/useTableManipulation'

export interface ItemEditHookOptions {
  itemList: Ref<API.ItemVo[]>
}

export interface ItemDetailEditorDialogOptions {
  props: {
    iconList?: API.IconVo[]
    areaList?: API.AreaVo[]
    iconMap?: Record<string, string>
  }
  listeners: Record<string, (event: string) => void>
}

export const useItemEdit = (options: ItemEditHookOptions) => {
  const { itemList } = options

  const editOptions = useRowEdit({
    rowList: itemList,
    saveHandler: async (_, newRowData) => {

    },
  })

  const { DialogService } = useGlobalDialog()

  const openItemDetailEditorDialog = async (index: number, options: ItemDetailEditorDialogOptions) => {
    await DialogService
      .config({ title: '编辑物品详情', width: '700px', top: '20px' })
      .props({
        item: itemList.value[index],
        iconList: options.props.iconList ?? [],
        areaList: options.props.areaList ?? [],
        iconMap: options.props.iconMap ?? {},
      })
      .listeners({
        ...options.listeners,
      })
      .open(ItemDetailEditor)
      .afterClosed<boolean>()
  }

  return { ...editOptions, openItemDetailEditorDialog }
}
