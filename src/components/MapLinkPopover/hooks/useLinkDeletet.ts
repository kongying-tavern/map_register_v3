import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useMarkerLinkStore, useMarkerStore } from '@/stores'
import { ElMessage } from 'element-plus'

export const useLinkDelete = () => {
  const markerStore = useMarkerStore()
  const markerLinkStore = useMarkerLinkStore()

  const { onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (link: API.MarkerLinkageVo) => {
      const { id, groupId } = link
      if (id === undefined)
        throw new Error('此关联的 id 为空')
      if (groupId === undefined)
        throw new Error('此关联的组 id 为空')
      const { data: { groups = [], markers = [] } = {} } = await Api.markerLink.deleteMarkerLinkage({
        ids: [id],
      })
      await markerLinkStore.afterUpdated(groups)
      await markerStore.afterUpdated(markers)
    },
  })

  onSuccess(() => {
    ElMessage.success('删除成功')
  })

  onError((err) => {
    ElMessage.error(`删除失败，原因为：${err.message}`)
  })

  return {
    onSuccess,
    onError,
    ...rest,
  }
}
