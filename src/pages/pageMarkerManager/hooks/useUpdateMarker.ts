import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'
import db from '@/database'
import type { HiddenFlagEnum } from '@/shared'

interface UpdateMarkerHookOptions extends Omit<FetchHookOptions<API.RPageListVoMarkerVo>, 'immediate'> {
  params: () => {
    ids: number[]
    refreshTime?: number
    content?: string
    hiddenFlag?: HiddenFlagEnum
  }
}

/** 更新点位列表 */
export const useMarkerBatchUpdate = (options: UpdateMarkerHookOptions) => {
  const { params, ...restOptions } = options

  const fetchParams = computed(() => params())

  const { refresh: updateMarkerInfo, onSuccess, ...rest } = useFetchHook({
    ...restOptions,
    onRequest: async () => {
      const { ids = [], ...otherKeyValue } = fetchParams.value

      const missions = ids.map(async (id) => {
        const markervo = await db.marker.get(id)
        markervo && (await Api.marker.updateMarker({ ...markervo, ...otherKeyValue }))
      })
      await Promise.allSettled(missions)

      // 提交更新后确认每个更新点位的数据变化，并将数据更新至本地
      const { data = [] } = await Api.marker.listMarkerById({}, ids)
      await db.marker.bulkPut(data)

      return ids
    },
  })

  onSuccess(() => {
    ElMessage.success('批量更新成功')
  })

  return { updateMarkerInfo, onSuccess, ...rest }
}
