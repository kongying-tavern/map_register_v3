import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface ItemListHookOption extends FetchHookOptions<API.RListItemVo> {
  params?: () => {
    typeIdList: number[]
    areaIdList: number[]
    current: number
    size: number
  }
}

/** 拉取物品id */
export const useItemList = (options: ItemListHookOption = {}) => {
  const { params } = options

  const fetchParams = computed(() => params?.())

  const itemList = ref<{
    label: string
    value: number
  }[]>([])

  const { refresh: getItemList, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      const data = fetchParams.value ?? {}
      return Api.item.listItemIdByType({}, data)
    },
  })

  onSuccess((rsp: API.RPageListVoItemVo) => {
    itemList.value = rsp.data?.record?.map(({
      itemId,
      name,
    }: any) => {
      return {
        label: `${name}(id: ${itemId})`,
        value: itemId,
      }
    }) || []
  })

  return { getItemList, itemList, ...rest }
}
