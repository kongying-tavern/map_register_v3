import { ElMessage, ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export type MaybeArray<T> = T | T[]

export const useCommonItemDelete = () => {
  const { refresh: deleteCommonItem, loading, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (maybeItems: MaybeArray<API.ItemAreaPublicVo>) => {
      const mission = Array.isArray(maybeItems)
        ? Promise.allSettled(maybeItems.map(item => Api.itemCommon.deleteCommonItem({ itemId: item.id! })))
        : Api.itemCommon.deleteCommonItem({ itemId: maybeItems.id! })
      await mission
    },
  })

  const confirmDelete = (maybeItems: MaybeArray<API.ItemAreaPublicVo>) => ElMessageBox.confirm(
    Array.isArray(maybeItems)
      ? <div>
          <div>将删除以下 {maybeItems.length} 个物品：</div>
          {maybeItems.map((item, index) => <div>&emsp;{index + 1}. <span style="color: #FB923C">{item.name} (id: {item.id})</span></div>)}
          <div>请确认？</div>
        </div>
      : <div>将删除物品<span style="color: #FB923C">{maybeItems.name} (id: {maybeItems.id})</span>，请确认？</div>,
    '警告',
    {
      confirmButtonClass: 'el-button--danger',
      beforeClose: async (action, instance, done) => {
        if (loading.value)
          return
        if (action !== 'confirm')
          return done()
        instance.confirmButtonLoading = true
        await deleteCommonItem(maybeItems)
        instance.confirmButtonLoading = false
        done()
      },
    },
  ).catch(() => false)

  onSuccess(() => ElMessage.success({
    message: '删除公共物品成功',
  }))

  onError(err => ElMessage.error({
    message: `删除公共物品失败，原因为：${err.message}`,
  }))

  return { confirmDelete, onSuccess, onError, loading, ...rest }
}
