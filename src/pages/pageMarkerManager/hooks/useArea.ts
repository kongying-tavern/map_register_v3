import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

/** 拉取地区列表 */
export const useArea = () => {
  const areaList = ref<{
    label: string
    value: number
  }[]>([])

  const { refresh: getArea, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      return Api.area.listArea({

      }, {
        parentId: -1,
        isTraverse: true,
      })
    },
  })

  onSuccess((rsp: API.RListAreaVo) => {
    areaList.value = rsp.data?.map(({
      areaId,
      name,
    }: any) => {
      return {
        label: name,
        value: areaId,
      }
    }) || []
  })

  return { getArea, areaList, ...rest }
}
