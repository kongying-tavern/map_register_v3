import { ElMessage } from 'element-plus'
import type { TweakControlInfo } from '.'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'
import db from '@/database'

export interface TweakHookOptions {
  markerList: Ref<API.MarkerVo[]>
  tweakList: Ref<TweakControlInfo[]>
  tweakData: Ref<Map<string, API.TweakConfigMetaVo>>
}

export const useMarkerTweaks = (options: TweakHookOptions) => {
  const { markerList, tweakList, tweakData } = options

  const isDisabled = computed(() => !tweakList.value.length)

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const markerIds = markerList.value.map(marker => marker.id!)

      const tweaks = tweakList.value.map(({ id, prop, modifier }) => {
        const meta = tweakData.value.get(id)!
        const config: API.TweakConfigVo = {
          prop,
          type: modifier.options.type,
          meta,
        } as API.TweakConfigVo
        return config
      })

      const { data = [] } = await Api.marker.tweakMarkers({
        markerIds,
        tweaks,
      })

      await db.marker.bulkPut(data)

      return data
    },
  })

  onSuccess(() => {
    ElMessage.success({
      message: '批量编辑成功',
      offset: 48,
    })
  })

  onError((err) => {
    ElMessage.error({
      message: `批量编辑失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  return {
    isDisabled,
    submit,
    onSuccess,
    ...rest,
  }
}
