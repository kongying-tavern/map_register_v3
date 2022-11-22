import type { Ref } from 'vue'
import { listArea } from '@/api/api/area'
import { array2Tree, messageFrom } from '@/utils'

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
  const { immediate = true, loading = ref(false), onSuccess, onError } = options

  const areaList = ref<API.AreaVo[]>([])

  const areaTree = computed(() => array2Tree(areaList.value, {
    idKey: 'areaId',
    pidKey: 'parentId',
    rootId: -1,
  }))

  const updateList = async () => {
    try {
      loading.value = true
      const res = await listArea({}, {
        isTestUser: false,
        isTraverse: true,
        parentId: -1,
      })
      areaList.value = res.data ?? []
      onSuccess?.(res)
    }
    catch (err) {
      onError?.(err instanceof Error ? err : new Error(messageFrom(err)))
    }
    finally {
      loading.value = false
    }
  }

  immediate && onMounted(updateList)

  return { areaList, areaTree, updateList }
}
