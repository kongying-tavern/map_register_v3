import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

/** 拉取物品类型 */
export const useItemType = () => {
  const itemTypeList = ref<{
    label: string
    value: number
  }[]>([])

  const { refresh: getItemType, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      return Api.itemType.listItemType({}, {})
    },
  })

  onSuccess((rsp: API.RListItemTypeVo) => {
    itemTypeList.value = rsp.data?.map(({
      typeId,
      name,
    }: any) => {
      return {
        label: name,
        value: typeId,
      }
    }) || []
  })

  return { getItemType, itemTypeList, ...rest }
}
