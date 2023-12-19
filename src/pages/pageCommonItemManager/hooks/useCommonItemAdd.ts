import { CommonItemAddEditor } from '../components'
import { useGlobalDialog } from '@/hooks'

interface ItemCreateHookOption {
  defaultItemData?: () => API.ItemVo
}

export interface ItemCreatorDialogOptions {
  props: {
    iconList?: API.IconVo[]
    areaList?: API.AreaVo[]
    iconMap?: Record<string, string>
  }
  listeners: Record<string, (event: string) => void>
}

export const useItemCreate = (options: ItemCreateHookOption) => {
  const { defaultItemData = () => ({} as API.ItemVo) } = options

  /** @TODO 暂定默认iconStyle默认样式 */
  const item = computed(() => {
    const i = defaultItemData()
    i.iconStyleType = 0
    return i
  })

  const { DialogService } = useGlobalDialog()

  const openItemCreatorDialog = async (options: ItemCreatorDialogOptions) => {
    await DialogService
      .config({ title: '批量添加', width: '700px', top: '20px' })
      .props({
        item: item.value,
        iconList: options.props.iconList ?? [],
        areaList: options.props.areaList ?? [],
        iconMap: options.props.iconMap ?? {},
        type: 'creator',
      })
      .listeners({
        ...options.listeners,
      })
      .open(CommonItemAddEditor)
      .afterClosed<boolean>()
  }

  return { openItemCreatorDialog }
}
