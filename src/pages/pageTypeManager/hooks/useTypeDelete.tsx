import { ElMessageBox } from 'element-plus'
import type { TypeManager, TypeObject } from '../config'
import { useFetchHook } from '@/hooks'

export const useTypeDelete = <T extends Record<string, unknown>>(manager: Ref<TypeManager<T>>) => {
  const { loading, refresh: deleteType, ...rest } = useFetchHook({
    onRequest: async (maybeTypes: TypeObject | TypeObject[]) => {
      const mission = Array.isArray(maybeTypes)
        ? Promise.allSettled(maybeTypes.map(singleType => manager.value.delete(singleType as T)))
        : manager.value.delete(maybeTypes as T)
      await mission
    },
  })

  const confirmDelete = (maybeTypes: TypeObject | TypeObject[]) => ElMessageBox.confirm(
    Array.isArray(maybeTypes)
      ? <div>
          <div>将删除以下 {maybeTypes.length} 个{manager.value.info.label}：</div>
          {maybeTypes.map((item, index) => <div>&emsp;{index + 1}. <span style="color: #FB923C">{item.name} (id: {item.id})</span></div>)}
          <div>该操作不可逆，请确认？</div>
        </div>
      : <div>将删除{manager.value.info.label}<span style="color: #FB923C">{maybeTypes.name} (id: {maybeTypes.id})</span>，该操作不可逆，请确认？</div>,
    '警告',
    {
      confirmButtonClass: 'el-button--danger',
      beforeClose: async (action, instance, done) => {
        if (loading.value)
          return
        if (action !== 'confirm')
          return done()
        instance.confirmButtonLoading = true
        await deleteType(maybeTypes)
        instance.confirmButtonLoading = false
        done()
      },
    },
  ).catch(() => false)

  return { loading, confirmDelete, ...rest }
}
