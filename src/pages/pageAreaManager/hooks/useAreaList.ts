import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'

export const useAreaList = () => {
  const error = ref('')

  const { refresh: updateAreaList, onSuccess, onError, ...rest } = useFetchHook({
    immediate: true,
    initialValue: [],
    onRequest: async () => {
      const { data = [] } = await Api.area.listArea({
        isTraverse: true,
        parentId: -1,
      })
      return data
    },
  })

  onError(err => ElMessage.error({
    message: `获取地区列表失败，原因为：${err.message}`,
  }))

  return { error, updateAreaList, onSuccess, ...rest }
}
