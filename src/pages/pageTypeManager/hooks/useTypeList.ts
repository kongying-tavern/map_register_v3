import type { PageListQueryParams } from '../config'
import type { TypeManagerKeys, TypeManagerMap } from '../definitions'
import { TYPE_MANAGER_KEY_MAP } from '../definitions'
import type { PaginationState } from '@/hooks'
import { useFetchHook } from '@/hooks'

export interface TypeListHookOptions {
  typeKey: Ref<keyof typeof TYPE_MANAGER_KEY_MAP>
  pagination: Ref<PaginationState>
  getParams: () => Omit<PageListQueryParams, 'current' | 'size'>
}

type ExtractListType<K extends TypeManagerKeys> = NonNullable<
  NonNullable<
    Awaited<
      ReturnType<
        TypeManagerMap[K]['list']
      >
    >['data']
  >['record']
>

export const useTypeList = <K extends keyof typeof TYPE_MANAGER_KEY_MAP>(options: TypeListHookOptions) => {
  const { typeKey, pagination, getParams } = options

  const params = computed(() => getParams())

  const typeList = shallowRef<ExtractListType<K>>([])
  const userMap = shallowRef<Record<string, API.SysUserSmallVo>>({})

  const { refresh: updateTypeList, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => {
      const { current, pageSize: size } = pagination.value
      const { typeIdList } = params.value
      return TYPE_MANAGER_KEY_MAP[typeKey.value].list({ current, size, typeIdList })
    },
  })

  onSuccess(({ data: { record = [], total = 0 } = {}, users = {} }) => {
    typeList.value = record
    pagination.value.total = total
    userMap.value = users
  })

  return { typeList, userMap, updateTypeList, onSuccess, ...rest }
}
