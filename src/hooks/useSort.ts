import type { MaybeRef, UnwrapRef } from 'vue'

export interface SortHookOptions<T> {
  refresh: () => void
  sortableKeys: MaybeRef<(keyof T)[]>
  defaultSort?: { prop: keyof T; order?: 'ascending' | 'descending' }
}

/**
 * @example
 * ```vue
 * <script lang="ts" setup>
 * const { data, refresh } = useFetchHook({
 *   initialValue: [],
 *   onRequest: async () => {
 *     const { record } = await Api.marker.listMarkerPage({
 *       ...requestParams.value,
 *     })
 *     return record
 *   },
 * })
 *
 * const { defaultSort, requestParams, onSortChange } = useSort<API.MarkerVo>({
 *   refresh,
 *   sortableKeys: ['id', 'linkageId'],
 *   defaultSort: { prop: 'id', order: 'ascending' },
 * })
 * </script>
 *
 * <template>
 * <el-table
 *   :data="data"
 *   :default-sort="defaultSort"
 *   v-on:sort-change="onSortChange"
 * >
 *   <el-table-column label="id" prop="id" sortable="custom" />
 *   <el-table-column label="关联id" prop="linkageId" sortable="custom" />
 * </el-table>
 * </template>
 * ```
 */
export const useSort = <T>(options: SortHookOptions<T>) => {
  const { sortableKeys, defaultSort, refresh } = options

  const enableKeys = computed(() => new Set(unref(sortableKeys)))

  type SortKey = `${Exclude<keyof UnwrapRef<T>, symbol>}${'+' | '-'}`

  const sort = ref<SortKey | undefined>()

  const requestParams = computed(() => ({
    sort: sort.value === undefined ? [] : [sort.value],
  }))

  const onSortChange = ({ prop, order }: { prop: keyof T; order: 'ascending' | 'descending' }) => {
    if (!enableKeys.value.has(prop))
      return
    sort.value = `${String(prop)}${order === 'ascending' ? '+' : '-'}` as SortKey
    refresh()
  }

  return {
    defaultSort,
    requestParams,
    onSortChange,
  }
}
