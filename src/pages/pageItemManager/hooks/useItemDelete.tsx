import { ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import { GSMessageService } from '@/components'
import Api from '@/api/api'

export interface ItemDeleteHookOptions {
  isRoot?: boolean
}

const { loading, refresh: deleteItem, onSuccess, onError, ...rest } = useFetchHook({
  onRequest: async (items: API.ItemVo | API.ItemVo[]) => {
    const mission = Array.isArray(items)
      ? Promise.allSettled(items.map(item => Api.item.deleteItem({ itemId: item.id! })))
      : Api.item.deleteItem({ itemId: items.id! })
    await mission
  },
})

export const useItemDelete = (options: ItemDeleteHookOptions = {}) => {
  const { isRoot } = options

  const confirmDelete = (items: API.ItemVo | API.ItemVo[]) => ElMessageBox.confirm(
    Array.isArray(items)
      ? <div>
          <div>将删除以下 {items.length} 个物品：</div>
          {items.map((item, index) => <div>&emsp;{index + 1}. <span style="color: #FB923C">{item.name} (id: {item.id})</span></div>)}
          <div>该操作不可逆，请确认？</div>
        </div>
      : <div>将删除物品<span style="color: #FB923C">{items.name} (id: {items.id})</span>，该操作不可逆，请确认？</div>,
    '警告',
    {
      confirmButtonClass: 'el-button--danger',
      beforeClose: async (action, instance, done) => {
        if (loading.value)
          return
        if (action !== 'confirm')
          return done()
        instance.confirmButtonLoading = true
        await deleteItem(items)
        instance.confirmButtonLoading = false
        done()
      },
    },
  ).catch(() => false)

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

  return { loading, confirmDelete, onSuccess, onError, ...rest }
}
