import { ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import { GSMessageService } from '@/components'
import Api from '@/api/api'

export interface ItemDeleteHookOptions {
  isRoot?: boolean
}

const { refresh: deleteItem, onSuccess, onError, ...rest } = useFetchHook({
  onRequest: async (itemIds?: number | number[]) => {
    if (itemIds === undefined)
      throw new Error('物品 id 为空')
    if (typeof itemIds === 'number')
      return await Api.item.deleteItem({ itemId: itemIds })
    return await Promise.allSettled(itemIds.map(itemId => Api.item.deleteItem({ itemId })))
  },
})

export const useItemDelete = (options: ItemDeleteHookOptions = {}) => {
  const { isRoot } = options

  const handleDelete = async (item: API.ItemVo) => {
    const isConfirm = await ElMessageBox
      .confirm(
        <span>删除物品<span style="color: #FB923C">{item.name} (id: {item.id})</span>，该操作不可逆，请确认？</span>,
        '确认操作',
      )
      .catch(() => false)
    if (!isConfirm)
      return
    await deleteItem(item.id)
  }

  const handleBatchDelete = async (items: API.ItemVo[]) => {
    const isConfirm = await ElMessageBox
      .confirm(
        <span>删除所选的 <span style="color: #FB923C">{items.length}</span> 个物品，该操作不可逆，请确认？</span>,
        '确认操作',
      )
      .catch(() => false)
    if (!isConfirm)
      return
    await deleteItem(items.map(item => item.id as number))
  }

  if (isRoot) {
    onSuccess(() => GSMessageService.info('删除成功，数据同步可能需要几分钟时间', {
      type: 'success',
      duration: 5000,
    }))
    onError(err => GSMessageService.info(`删除失败：${err.message}`, {
      type: 'error',
      duration: 5000,
    }))
  }

  return { handleDelete, handleBatchDelete, onSuccess, onError, ...rest }
}
