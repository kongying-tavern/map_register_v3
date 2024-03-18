import { HiddenFlagEnum } from '@/shared'
import { useFetchHook } from '@/hooks'
import { GSMessageService } from '@/components'
import Api from '@/api/api'
import db from '@/database'

export interface MarkerBatchEditForm {
  content: string
  refreshTime: number
  hiddenFlag: HiddenFlagEnum
}

export interface MarkerBatchEditHookOptions {
  getParams: () => API.MarkerVo[]
}

/** 批量编辑点位 */
export const useMarkerBatchEdit = (options: MarkerBatchEditHookOptions) => {
  const { getParams } = options

  const batchEditForm = ref<MarkerBatchEditForm>({
    content: '',
    refreshTime: 0,
    hiddenFlag: HiddenFlagEnum.SHOW,
  })

  const { refresh: batchEditMarker, onSuccess, ...rest } = useFetchHook({
    onRequest: async () => {
      const markers = getParams()

      const missions = markers.map(marker => Api.marker.updateMarker({}, { ...marker, ...batchEditForm.value }))
      await Promise.allSettled(missions)

      // 提交更新后确认每个更新点位的数据变化，并将数据更新至本地
      const { data = [] } = await Api.marker.listMarkerById({}, markers.map(marker => marker.id!))
      await db.marker.bulkPut(data)
    },
  })

  onSuccess(() => {
    GSMessageService.info('批量编辑成功', { type: 'success' })
  })

  return { batchEditForm, batchEditMarker, onSuccess, ...rest }
}
