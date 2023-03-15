import type { Ref } from 'vue'
import Api from '@/api/api'
import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'
import db from '@/database'
import type { MarkerExtra } from '@/utils'
import { ExtraJSON } from '@/utils'

export interface MarkerQueryParams extends API.MarkerSearchVo {
  /** 显示审核中点位 */
  showPunctuateMarker: boolean
  /** 显示审核通过点位 */
  showAuditedMarker: boolean
  /** 只显示地下点位 */
  onlyUnderground: boolean
  /** 是否显示特殊点位(如: 锚点、洞口) */
  showSpecial: boolean
}

export interface MarkerListHookOptions extends FetchHookOptions<API.RListMarkerVo> {
  /** 参数函数 */
  params?: () => MarkerQueryParams
  watchParams?: boolean
}

export interface UnionMarkerVo extends API.MarkerPunctuateVo, API.MarkerVo {
  extraObject: MarkerExtra
  coordinate: [number, number]
}

/** 共享的点位列表 */
const markerList = ref([]) as Ref<UnionMarkerVo[]>
/** 共享的点位列表加载态，可覆盖 */
const loading = ref(false)

export const parserMarker = (marker: API.MarkerPunctuateVo | API.MarkerVo): UnionMarkerVo => ({
  ...marker,
  extraObject: ExtraJSON.parse(marker.extra ?? ''),
  coordinate: (marker.position?.split(',').map(Number) as [number, number]),
})

export const useMarkerList = (options: MarkerListHookOptions = {}) => {
  const {
    immediate,
    loading: scopedLoading,
    params = () => ({} as MarkerQueryParams),
  } = options

  /** 点位请求参数 */
  const fetchParams = computed(() => params?.() ?? {})

  /** 请求点位 */
  const fetchMarkers = async () => {
    const {
      showAuditedMarker,
      showPunctuateMarker,
      showSpecial,
      onlyUnderground,
    } = fetchParams.value

    let { itemIdList = [] } = fetchParams.value

    // 特殊点位
    !showSpecial && (itemIdList = (await db.item.bulkGet(itemIdList)).reduce((seed, item) => {
      (item && item.specialFlag !== 1) && seed.push(item.itemId as number)
      return seed
    }, [] as number[]))

    let tempMarkers: (API.MarkerPunctuateVo | API.MarkerVo)[] = []
    if (!itemIdList.length)
      return tempMarkers.map(parserMarker)

    // 已审点位
    if (showAuditedMarker) {
      const data = await db.marker.where('itemIdList').anyOf(itemIdList).toArray()
      tempMarkers = tempMarkers.concat(data)
    }

    // 未审点位
    // TODO 逻辑可能变更
    if (showPunctuateMarker) {
      const { data: { record = [] } = {} } = await Api.punctuate
        .listPunctuatePage({ current: 1, size: 0 })
        .then(res => res.data?.total ?? 0) // 不分页，先获取一次 total，然后再获取全部
        .then(size => Api.punctuate.listPunctuatePage({ current: 1, size }))
      tempMarkers = tempMarkers.concat(record)
    }

    const parseredMarkerList = tempMarkers
      .map(parserMarker)
      .filter(marker => onlyUnderground ? marker.extraObject.underground?.is_underground : true)

    return parseredMarkerList
  }

  /** 点位相关方法 */
  const { refresh: updateMarkerList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading ?? loading,
    onRequest: fetchMarkers,
  })

  onSuccess(markers => markerList.value = markers)

  watch(fetchParams, updateMarkerList)

  return { markerList, updateMarkerList, onSuccess, ...rest }
}
