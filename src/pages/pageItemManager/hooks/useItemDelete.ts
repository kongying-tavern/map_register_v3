import type * as API2 from '@/api/alova/globals'
import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import { useItemStore } from '@/stores'

export const useItemDelete = () => {
  const itemStore = useItemStore()

  const { loading, refresh: deleteItem, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (item: API2.ItemVo) => {
      await itemStore.deleteItem(item.id!)
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
