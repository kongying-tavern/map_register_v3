import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface IconsHookOptions extends FetchHookOptions<API.RPageListVoIconVo> {
  /** 首次请求的总数 */
  preFetchCount?: number
  params?: () => API.IconSearchVo
}

const iconList = ref<API.IconVo[]>([])

export const useIconList = (options: IconsHookOptions = {}) => {
  const { immediate = true, loading = ref(false), preFetchCount = 500, params } = options

  const iconMap = computed(() => iconList.value.reduce((seed, { name, url }) => {
    if (name && url)
      seed[name] = url
    return seed
  }, {} as Record<string, string>))

  const { refresh: updateIconList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: async () => {
      // 两次请求，第一次获取定量，如果总数大于定量，则第二次请求全部
      let res = await Api.icon.listIcon({ size: preFetchCount })
      if ((res.data?.total ?? 0) > preFetchCount) {
        console.log('第二次')
        res = await Api.icon.listIcon({
          current: 1,
          size: res.data?.total ?? preFetchCount,
          ...params?.(),
        })
      }
      return res
    },
  })

  onSuccess(({ data: { record = [] } = {} }) => {
    iconList.value = record
  })

  return { iconList, iconMap, updateIconList, onSuccess, ...rest }
}
