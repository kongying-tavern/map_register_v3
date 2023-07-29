import { ElMessageBox } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useAreaDelete = () => {
  const { loading, refresh: deleteItem, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (maybeAreas: API.AreaVo | API.AreaVo[]) => {
      const mission = Array.isArray(maybeAreas)
        ? Promise.allSettled(maybeAreas.map(item => Api.area.deleteArea({ areaId: item.id! })))
        : Api.area.deleteArea({ areaId: maybeAreas.id! })
      await mission
    },
  })

  const confirmDelete = (maybeAreas: API.AreaVo | API.AreaVo[]) => ElMessageBox.confirm(
    Array.isArray(maybeAreas)
      ? <div>
          <div>将删除以下 {maybeAreas.length} 个地区：</div>
          {maybeAreas.map((item, index) => <div>&emsp;{index + 1}. <span style="color: #FB923C">{item.name} (id: {item.id})</span></div>)}
          <div>该操作不可逆，请确认？</div>
        </div>
      : <div>将删除地区<span style="color: #FB923C">{maybeAreas.name} (id: {maybeAreas.id})</span>，该操作不可逆，请确认？</div>,
    '警告',
    {
      confirmButtonClass: 'el-button--danger',
      beforeClose: async (action, instance, done) => {
        if (loading.value)
          return
        if (action !== 'confirm')
          return done()
        instance.confirmButtonLoading = true
        await deleteItem(maybeAreas)
        instance.confirmButtonLoading = false
        done()
      },
    },
  ).catch(() => false)

  return { loading, confirmDelete, onSuccess, onError, ...rest }
}
