import type { ComputedRef, Ref } from 'vue'
import Api from '@/api/api'
import { array2Tree } from '@/utils'
import { useFetchHook } from '@/hooks'
import { useMapStore } from '@/stores'

export interface AreaListHookOptions {
  immediate?: boolean
  loading?: Ref<boolean>
}

export interface AreaTreeItem extends API.AreaVo {
  children?: AreaTreeItem[]
}

const areaList = ref([]) as Ref<API.AreaVo[]>

export const useAreaList = (options: AreaListHookOptions = {}) => {
  const { immediate = true, loading = ref(false) } = options

  const areaMap = computed(() => Object.fromEntries(areaList.value.map(area => [
    area.areaId as number,
    area,
  ]))) as ComputedRef<Record<number, API.AreaVo>>

  const areaTree = computed(() => array2Tree(areaList.value, {
    idKey: 'areaId',
    pidKey: 'parentId',
    rootId: -1,
  }))

  const mapStore = useMapStore()

  const selectedArea = computed(() => {
    if (!mapStore.areaCode)
      return
    return areaList.value.find(area => area.code === mapStore.areaCode)?.areaId
  })

  const { refresh, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: () => Api.area.listArea({}, { isTraverse: true, parentId: -1 }),
  })

  onSuccess(({ data = [] }) => {
    areaList.value = data.sort(({ sortIndex: ia }, { sortIndex: ib }) => {
      if (ia === undefined || ib === undefined)
        return 0
      return ib - ia
    })
  })

  return { areaList, areaTree, areaMap, selectedArea, updateAreaList: refresh, onSuccess, ...rest }
}
