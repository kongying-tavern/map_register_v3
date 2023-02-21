import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'
import { array2Tree } from '@/utils'
import Api from '@/api/api'

/** 共享的物品类型列表 */
const typeList = ref<API.ItemTypeVo[]>([])
/** 共享的物品类型列表加载态，可覆盖 */
const loading = ref(false)
/** 共享的物品类型树（由列表转换） */
const typeTree = computed(() => array2Tree(typeList.value, {
  idKey: 'typeId',
  pidKey: 'parentId',
  rootId: -1,
}))
/** 共享的物品 id → 物品对象映射表 */
const typeMap = computed(() => typeList.value.reduce((seed, typeObj) => {
  typeObj.typeId !== undefined && (seed[typeObj.typeId] = typeObj)
  return seed
}, {} as Record<number, API.ItemTypeVo>))

/** 物品类型列表与相关操作方法 */
export const useTypeList = (options: FetchHookOptions<API.RPageListVoItemTypeVo> = {}) => {
  const { immediate, loading: scopedLoading } = options

  const { refresh: updateTypeList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading: scopedLoading ?? loading,
    onRequest: () => Api.itemType.listItemType({}),
  })

  onSuccess(({ data = [] }) => {
    typeList.value = data.sort(({ sortIndex: ia }, { sortIndex: ib }) => {
      if (ia === undefined || ib === undefined)
        return 0
      return ib - ia
    })
  })

  return { typeList, typeTree, typeMap, updateTypeList, onSuccess, ...rest }
}
