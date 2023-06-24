import { ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

const sharedItemId = ref<number>()

export const useItemDelete = () => {
  const { refresh: deleteItem, onFinish, ...rest } = useFetchHook({
    onRequest: async () => {
      if (sharedItemId.value === undefined)
        throw new Error('所需的物品 id 为空')
      await Api.item.deleteItem({
        itemId: sharedItemId.value,
      })
    },
  })

  const handleDelete = async (item: API.ItemVo) => {
    sharedItemId.value = item.id
    const isConfirm = await ElMessageBox
      .confirm(
        <span>删除物品<span style="color: #FB923C">{item.name} (id: {item.id})</span>，该操作不可逆，请确认？</span>,
        '确认操作',
      )
      .catch(() => false)
    if (!isConfirm)
      return
    await deleteItem()
  }

  onFinish(() => {
    sharedItemId.value = undefined
  })

  return { handleDelete, ...rest }
}
