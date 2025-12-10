import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import { useMarkerLinkStore } from '@/stores'

export const useLinkCreate = () => {
  const markerLinkStore = useMarkerLinkStore()

  const { onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (links: API.MarkerLinkageVo[]) => {
      return await markerLinkStore.linkMarker(links)
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '关联操作成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `关联操作失败，原因为：${err.message}`,
    })
  })

  return { onSuccess, ...rest }
}
