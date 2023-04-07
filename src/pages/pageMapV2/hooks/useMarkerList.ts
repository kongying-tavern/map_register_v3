const markerList = ref<API.MarkerVo[]>([])

/** 该 hooks 仅限 MapV2 内使用，用于在当前组件内进行数据和操作共享 */
export const useMarkerList = () => {
  return { markerList }
}
