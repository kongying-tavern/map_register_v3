import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import db from '@/database/db'
import { useFetchHook } from '@/hooks'
import { HashFlag } from '@/shared'
import { useMarkerLinkStore } from '@/stores'

export const useLinkDelete = () => {
  const markerLinkStore = useMarkerLinkStore()

  const { onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (link: API.MarkerLinkageVo) => {
      const { id, groupId } = link
      if (id === undefined)
        throw new Error('此关联的 id 为空')
      if (groupId === undefined)
        throw new Error('此关联的组 id 为空')
      // 删除单条关联
      const { data = {} } = await Api.markerLink.deleteMarkerLinkage({
        ids: [id],
      })
      markerLinkStore.unsafeDelete([id])
      await db.app.markerLink.delete(id)
      return data
    },
  })

  onSuccess(async ({ groups: groupIds = [], markers: markerIds = [] }) => {
    try {
      ElMessage.success('删除成功')
      await Promise.all([
        (async () => {
          const { data = {} } = await Api.markerLink.getMarkerLinkageList({ groupIds })
          const links = Object.values(data).flat(1)
          await db.app.markerLink.bulkPut(links)
        })(),
        (async () => {
          const { data: markers = [] } = await Api.marker.listMarkerById(markerIds)
          await db.app.marker.bulkPut(markers.map(marker => ({
            ...marker,
            __hash: HashFlag.LOCAL,
          })))
        })(),
      ])
    }
    catch {
      ElMessage.warning('删除成功，但是更新本地数据失败，稍后系统将会自动同步关联数据')
    }
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
