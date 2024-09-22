import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useItemDelete = () => {
  const { loading, refresh: deleteItem, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (item: API.ItemVo) => {
      await Api.item.deleteItem({ itemId: item.id! })
      return item
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '删除物品成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `删除物品失败，原因为：${err.message}`,
    })
  })

  return { loading, deleteItem, onSuccess, onError, ...rest }
}
