import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'

interface IconsHookOptions extends FetchHookOptions<API.RPageListVoIconVo> {
  /** 首次请求的总数 */
  preFetchCount?: number
  params?: () => API.IconSearchVo
}

/** 共享的图标列表 */
const iconList = ref<API.IconVo[]>([])
/** 共享的图标映射表 */
const iconMap = computed(() => iconList.value.reduce((seed, { name, url }) => {
  if (name && url)
    seed[name] = url
  return seed
}, {} as Record<string, string>))
/** 共享的图标列表加载态，可覆盖 */
const loading = ref(false)

/** 图标 hook，在子组件中使用时如果不需要重复请求，可将 immediate 设置为 false */
export const useIconList = (options: IconsHookOptions = {}) => {
  const { immediate, loading: scopedLoading, preFetchCount = 500, params } = options

  const { refresh: updateIconList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading ?? loading,
    onRequest: async () => {
      // 两次请求，第一次获取定量，如果总数大于定量，则第二次请求全部
      let res = await Api.icon.listIcon({ size: preFetchCount })
      if ((res.data?.total ?? 0) > preFetchCount) {
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
