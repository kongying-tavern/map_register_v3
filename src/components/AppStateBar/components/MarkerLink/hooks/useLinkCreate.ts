import Api from '@/api/api'
import db from '@/database'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'

export const useLinkCreate = () => {
  const { onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (links: API.MarkerLinkageVo[]) => {
      if (!links.length)
        throw new Error('提交的关联项为空')

      // 1. 进行关联操作（只取必须的属性）
      const { data: newLinkageId } = await Api.markerLink.linkMarker(links.map(link => ({
        fromId: link.fromId,
        toId: link.toId,
        linkAction: link.linkAction,
        path: link.path,
      })))

      if (!newLinkageId)
        throw new Error('服务器未返回新关联组 id')

      // 2. 确认关联更新
      const { data: linkGroups = {} } = await Api.markerLink.getMarkerLinkageList({
        groupIds: [newLinkageId],
      })
      const newLinks = Object.values(linkGroups).flat(1)

      // 3. 收集旧关联影响的全部点位 id
      const oldEffectedMarkerIdSet = links.reduce((result, { fromId = -1, toId = -1 }) => {
        result.add(fromId)
        result.add(toId)
        return result
      }, new Set<number>())
      oldEffectedMarkerIdSet.delete(-1) // 优化: 添加默认值然后删除的操作比起在循环里判断是否为数值再添加更快
      const oldEffectedMarkerIds = Array.from(oldEffectedMarkerIdSet)

      // 4. 收集新关联影响的全部点位 id
      const newEffectedMarkerIdSet = newLinks.reduce((result, { fromId = -1, toId = -1 }) => {
        result.add(fromId)
        result.add(toId)
        return result
      }, new Set<number>())
      newEffectedMarkerIdSet.delete(-1)
      const newEffectedMarkerIds = Array.from(newEffectedMarkerIdSet)

      // 5. 更新本地数据
      await db.transaction('rw', db.marker, db.markerLink, async () => {
        // 5.1 更新本地关联表
        await db.markerLink.bulkPut(newLinks)

        // 5.2 清理受影响点位所属的关联组
        await db.marker.where('id').anyOf(oldEffectedMarkerIds).modify({ linkageId: '' })

        // 5.3 更新受影响的点位所属的关联组
        await db.marker.where('id').anyOf(newEffectedMarkerIds).modify({ linkageId: newLinkageId })
      })
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
