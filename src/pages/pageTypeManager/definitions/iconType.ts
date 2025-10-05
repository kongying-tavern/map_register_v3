import type { PageListQueryParams, TypeManager } from '../config'
import Api from '@/api/api'

export class IconTypeManager implements TypeManager<API.IconTypeVo> {
  get info() {
    return {
      label: '图标类型',
    }
  }

  getId = (data: API.IconTypeVo) => data.id

  getName = (data: API.IconTypeVo) => `${data.name ?? `(id:${data.id})`}`

  getIsLeaf = (data: API.IconTypeVo) => data.isFinal

  list = (params: PageListQueryParams<API.IconTypeVo>) => {
    const { node, ...rest } = params
    return Api.iconType.listIconType({
      typeIdList: node === undefined ? [-1] : [node.id!],
      ...rest,
    })
  }

  create = (IconType: API.IconTypeVo, parent?: API.IconTypeVo) => {
    const { name } = IconType
    return Api.iconType.addIconType({
      name,
      parentId: parent?.id ?? -1,
    })
  }

  delete = (IconType: API.IconTypeVo) => Api.iconType.deleteIconType({ typeId: IconType.id! })

  update = (IconType: API.IconTypeVo) => Api.iconType.updateIconType(IconType)
}
