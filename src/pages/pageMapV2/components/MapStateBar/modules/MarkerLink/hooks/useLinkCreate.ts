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
      const { data: linkageId = '' } = await Api.markerLink.linkMarker({}, linkList)

      // 查询关联更新
      const { data: updatedLinks = {} } = await Api.markerLink.getList({
        groupIds: [linkageId],
      })

      // 查询点位更新
      const { data: updatedMarkers = [] } = await Api.marker.listMarkerById({}, [...affectedMarkerIds])

      // 1. 删除所有受影响的点位的 linkageId
      // 2. 对存在于新关联组内的点位设置新的 linkageId
      await db.transaction('rw', db.marker, db.markerLink, async () => {
        await db.marker.bulkPut(updatedMarkers)
        await db.markerLink.bulkPut(Object.values(updatedLinks).flat(1))
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
