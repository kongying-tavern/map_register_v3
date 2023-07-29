import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

interface UserListHookOptions {
  getParams: () => API.AreaSearchVo
}

export const useAreaList = (options: UserListHookOptions) => {
  const { getParams } = options

  const areaList = shallowRef<API.AreaVo[]>([])
  const userMap = shallowRef<Record<string, API.SysUserSmallVo>>({})
  const params = computed(() => getParams())

  const { refresh: updateAreaList, onSuccess, onError, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => Api.area.listArea({}, {
      isTraverse: false,
      parentId: params.value.parentId ?? -1,
    }),
  })

  watch(() => params.value.parentId, updateAreaList)

  onSuccess(({ data = [], users = {} }) => {
    areaList.value = data
    userMap.value = users
  })

  onError(err => ElMessage.error({
    message: `获取地区列表失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { areaList, userMap, updateAreaList, onSuccess, ...rest }
}
