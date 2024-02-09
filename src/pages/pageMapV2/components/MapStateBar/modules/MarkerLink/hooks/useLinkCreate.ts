import { ElMessage } from 'element-plus'
import type { MLContext } from '../core'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'
import db from '@/database'

export const useLinkCreate = (context: MLContext) => {
  const { onSuccess, onError, onFinish, ...rest } = useFetchHook({
    onRequest: async () => {
      context.setLoading(true)

      // 受影响的点位 id
      const affectedMarkerIds = new Set<number>()

      // 将未存在关联组但受影响的点位加入到受影响点位 id 集合
      const linkageIds = Object.keys(context.existLinkGroups.value)

      await db.marker.where('linkageId').anyOf(linkageIds).each(({ id }) => {
        affectedMarkerIds.add(id!)
      })

      // 获取存在于关联组内的点位 id，同时加入到受影响的点位 id 集合
      const linkingMarkerIds = new Set<number>()

      context.modifiedLinkList.value.forEach(({ fromId, toId }) => {
        linkingMarkerIds.add(fromId)
        linkingMarkerIds.add(toId)
      })

      // 提交关联
      const linkList: API.MarkerLinkageVo[] = context.modifiedLinkList.value.map(({ fromId, toId, linkAction }) => ({
        fromId,
        toId,
        linkAction,
        linkReverse: false,
      }))
      const { data: linkageId = '' } = await Api.markerLink.linkMarker(linkList)

      // 1. 删除所有受影响的点位的 linkageId
      // 2. 对存在于新关联组内的点位设置新的 linkageId
      await db.transaction('rw', db.marker, db.markerLink, async () => {
        const affectedMarkers = await db.marker.where('id').anyOf([...affectedMarkerIds]).toArray()
        const modifiedMarkers = affectedMarkers.map(marker => ({
          ...marker,
          linkageId: linkingMarkerIds.has(marker.id!) ? linkageId : '',
        }))
        await db.marker.bulkPut(modifiedMarkers)

        // 更新本地点位关联数据库
        const { data = {} } = await Api.markerLink.getList({
          groupIds: [linkageId],
        })
        await db.markerLink.bulkPut(Object.values(data).flat(1))
      })
    },
  })

  onSuccess(() => {
    context.cancel()
    ElMessage.success({
      offset: 48,
      message: '关联成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      offset: 48,
      message: `关联操作失败，原因为：${err.message}`,
    })
  })

  onFinish(() => {
    context.setLoading(false)
  })

  return { onSuccess, ...rest }
}
