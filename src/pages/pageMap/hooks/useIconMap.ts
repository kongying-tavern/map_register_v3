import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface IconsHookOptions extends FetchHookOptions<API.RPageListVoIconVo> {
  params?: () => API.IconSearchVo
}

export const useIconMap = (options: IconsHookOptions = {}) => {
  const { immediate = true, loading = ref(false), params, onSuccess, onError } = options

  const iconList = ref<API.IconVo[]>([])

  const iconMap = computed(() => iconList.value.reduce((seed, { name, url }) => {
    if (name && url)
      seed[name] = url
    return seed
  }, {} as Record<string, string>))

  const { refresh } = useFetchHook({
    immediate,
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

  return { iconList, iconMap, loading, updateIconList: refresh }
}
