import type { ComputedRef, Ref } from 'vue'
import Api from '@/api/api'
import { array2Tree } from '@/utils'
import { useFetchHook } from '@/hooks'

export interface AreaListHookOptions<T> {
  immediate?: boolean
  loading?: Ref<boolean>
  onSuccess?: (res: API.RListAreaVo) => T[]
  onError?: (err: Error) => void
}

export interface AreaTreeItem extends API.AreaVo {
  children?: AreaTreeItem[]
}

export const useAreaList = <T = any>(options: AreaListHookOptions<T> = {}) => {
  const { immediate = true, loading = ref(false) } = options

  const areaList = ref<API.AreaVo[]>([])

  const areaMap = computed(() => Object.fromEntries(areaList.value.map(area => [
    area.areaId as number,
    area,
  ]))) as ComputedRef<Record<number, API.AreaVo>>

  const areaTree = computed(() => array2Tree(areaList.value, {
    idKey: 'areaId',
    pidKey: 'parentId',
    rootId: -1,
  }))

  const { refresh, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: () => Api.area.listArea({}, { isTestUser: false, isTraverse: true, parentId: -1 }),
  })

  onSuccess((res) => {
    areaList.value = res.data ?? []
  })

  return { areaList, areaTree, areaMap, updateAreaList: refresh, onSuccess, ...rest }
}
