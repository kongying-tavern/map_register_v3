import { ElMessage } from 'element-plus'
import type { MLContext } from '../core'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'
import db from '@/database'

export const useLinkCreate = (context: MLContext) => {
  const { onSuccess, onError, onFinish, ...rest } = useFetchHook({
    onRequest: async () => {
      context.setLoading(true)

      // 受影响的点位集合
      const affectedMarkerIds = new Set<number>()

      // 受影响的关联组集合（不属于新增关联），并排除掉为空的组ID
      const affectedLinkGroupIds = Object.keys(context.existLinkGroups.value)

      // 将受影响的点位加入到受影响点位集合 (仅对组ID不为空的组进行处理)
      await db.marker.where('linkageId').anyOf(affectedLinkGroupIds).each(({ id, linkageId }) => {
        if (!linkageId)
          return
        affectedMarkerIds.add(id!)
      })

      // 将新增关联内的点位加入到受影响的点位集合
      context.modifiedLinkList.value.forEach(({ fromId, toId }) => {
        affectedMarkerIds.add(fromId)
        affectedMarkerIds.add(toId)
      })

      // 提交关联
      const linkList: API.MarkerLinkageVo[] = context.modifiedLinkList.value.map(({ fromId, toId, linkAction }) => ({
        fromId,
        toId,
        linkAction,
        linkReverse: false,
      }))

      const { data: linkageId = '' } = await Api.markerLink.linkMarker(linkList)

      // 查询关联更新
      const { data: updatedLinks = {} } = await Api.markerLink.getMarkerLinkageList({
        groupIds: [linkageId],
      })

      // 查询点位更新
      const { data: updatedMarkers = [] } = await Api.marker.listMarkerById([...affectedMarkerIds])

      await db.transaction('rw', db.marker, db.markerLink, async () => {
        // 1. 更新所有受影响的点位
        await db.marker.bulkPut(updatedMarkers)
        // 2. 删除所有受影响的关联组
        await db.markerLink.where('groupId').anyOf(affectedLinkGroupIds).delete()
        // 3. 更新新的关联组
        await db.markerLink.bulkPut(Object.values(updatedLinks).flat(1))
      })
    },
  })

  onSuccess(() => {
    context.cancel()
    ElMessage.success({
      message: '关联成功',
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `关联操作失败，原因为：${err.message}`,
    })
  })

  onFinish(() => {
    context.setLoading(false)
  })

  return { onSuccess, ...rest }
}
