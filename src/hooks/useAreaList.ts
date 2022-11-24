import type { Ref } from 'vue'
import Api from '@/api/api'
import { array2Tree } from '@/utils'
import { useFetchHook } from '@/hooks'

export interface AreaListHookOptions {
  immediate?: boolean
  loading?: Ref<boolean>
  onSuccess?: (res: API.RListAreaVo) => void
  onError?: (err: Error) => void
}

export interface AreaTreeItem extends API.AreaVo {
  children?: AreaTreeItem[]
}

export const useAreaList = (options: AreaListHookOptions = {}) => {
  const { immediate = true, loading = ref(false) } = options

  const areaList = ref<API.AreaVo[]>([])

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

  return { areaList, areaTree, updateAreaList: refresh, onSuccess, ...rest }
}
