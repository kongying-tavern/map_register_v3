import { listArea } from '@/api/api/area'
import { array2Tree } from '@/utils'

export interface AreaListHookOptions {
  immediate?: boolean
}

export interface AreaTreeItem extends API.AreaVo {
  children?: AreaTreeItem[]
}

export const useAreaList = (options: AreaListHookOptions = {}) => {
  const { immediate = true } = options

  const areaList = ref<API.AreaVo[]>([])
  const areaId = ref<number>()

  const areaTree = computed(() => array2Tree(areaList.value, {
    idKey: 'areaId',
    pidKey: 'parentId',
    rootId: -1,
  }))

  const updateList = async () => {
    const { data = [] } = await listArea({}, {
      isTestUser: false,
      isTraverse: true,
      parentId: -1,
    })
    areaList.value = data
    console.log(areaTree.value)
  }

  immediate && onMounted(() => nextTick(updateList))

  return { areaId, areaList, areaTree, updateList }
}
