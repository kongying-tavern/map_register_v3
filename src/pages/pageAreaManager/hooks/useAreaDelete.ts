import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export const useAreaDelete = () => {
  const { loading, refresh: deleteArea, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (area: API.AreaVo) => {
      await Api.area.deleteArea({ areaId: area.id! })
      return area
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '删除地区成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `删除地区失败，原因为：${err.message}`,
    })
  })

  return { loading, deleteArea, onSuccess, onError, ...rest }
}
