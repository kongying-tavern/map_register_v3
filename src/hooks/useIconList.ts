import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface IconsHookOptions extends FetchHookOptions<API.RPageListVoIconVo> {
  debounceTime?: number
  params?: () => API.IconSearchVo
}

const iconList = ref<API.IconVo[]>([])

export const useIconList = (options: IconsHookOptions = {}) => {
  const { immediate, loading = ref(false), debounceTime = 1000, params, onSuccess, onError } = options

  const iconMap = computed(() => iconList.value.reduce((seed, { name, url }) => {
    if (name && url)
      seed[name] = url
    return seed
  }, {} as Record<string, string>))

  const { refresh } = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      let res = await Api.icon.listIcon({})
      if (res.data?.total ?? 0 > 10) {
        res = await Api.icon.listIcon({
          iconIdList: [],
          typeIdList: [],
          current: 1,
          size: res.data?.total,
          ...params?.(),
        })
      }
      return res
    },
    onSuccess: (res) => {
      iconList.value = res.data?.record ?? []
      onSuccess?.(res)
    },
    onError,
  })

  const updateIconList = useDebounceFn(refresh, debounceTime)

  return { iconList, iconMap, loading, updateIconList }
}
