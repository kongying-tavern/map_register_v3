import type { ComputedRef, Ref } from 'vue'
import { liveQuery } from 'dexie'
import { useSubscription } from '@vueuse/rxjs'
import { storeToRefs } from 'pinia'
import { array2Tree } from '@/utils'
import { useFetchHook } from '@/hooks'
import { useAreaStore } from '@/stores'
import db from '@/database'

export interface AreaListHookOptions {
  immediate?: boolean
  loading?: Ref<boolean>
}

export interface AreaTreeItem extends API.AreaVo {
  children?: AreaTreeItem[]
}

export const useAreaList = (options: AreaListHookOptions = {}) => {
  const { immediate, loading } = options

  const { areaList } = storeToRefs(useAreaStore())

  const areaMap = computed(() => Object.fromEntries(areaList.value.map(area => [
    area.id as number,
    area,
  ]))) as ComputedRef<Record<number, API.AreaVo>>

  const areaTree = computed(() => array2Tree(areaList.value, {
    childrenKey: 'children',
    idKey: 'id',
    pidKey: 'parentId',
    rootId: -1,
  }))

  const { refresh: updateAreaList, onSuccess, ...rest } = useFetchHook({
    immediate,
    loading,
    onRequest: () => db.area.toArray(),
  })

  onSuccess((data) => {
    areaList.value = data.sort(({ sortIndex: ia }, { sortIndex: ib }) => {
      if (ia === undefined || ib === undefined)
        return 0
      return ib - ia
    })
  })

  useSubscription(liveQuery(() => db.area.toCollection()).subscribe(updateAreaList))

  return { areaList, areaTree, areaMap, updateAreaList, onSuccess, ...rest }
}
