import type Node from 'element-plus/es/components/tree/src/model/node'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export const useIconTypeList = () => {
  const cachedIconTypeList = ref<API.IconTypeVo[]>([])

  const { refresh, onSuccess, ...rest } = useFetchHook({
    onRequest: (id: number) => Api.iconType.listIconType({
      typeIdList: [id],
      current: 1,
      size: 10,
    }),
  })

  onSuccess(({ data: { record = [] } = {} }) => {
    cachedIconTypeList.value = record
  })

  const lazyLoadNode = (node: Node, resolve: (data: API.IconTypeVo[]) => void) => {
    refresh(node.level === 0 ? -1 : node.id).then(() => resolve(cachedIconTypeList.value))
  }

  const iconTreeSelectProps = {
    label: 'name',
    isLeaf: 'isFinal',
    value: 'id',
  }

  return { iconTreeSelectProps, lazyLoadNode, ...rest }
}
