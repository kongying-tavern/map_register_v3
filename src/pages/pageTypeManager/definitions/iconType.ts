import type { PageListQueryParams, TypeManager } from '../config'
import Api from '@/api/api'

export class IconTypeManager implements TypeManager<API.IconTypeVo> {
  get info() {
    return {
      label: '图片资源类型',
    }
  }

  getKey = (data: API.IconTypeVo) => `${data.id}`

  getName = (data: API.IconTypeVo) => `${data.name ?? `(id:${data.id})`}`

  list = (params: PageListQueryParams<API.IconTypeVo>) => {
    const { node, ...rest } = params
    return Api.iconType.listIconType({
      typeIdList: node === undefined ? [-1] : [node.id!],
      ...rest,
    })
  }

  create = (iconType: API.IconTypeVo) => Api.iconType.addIconType(iconType)

  delete = (iconType: API.IconTypeVo) => Api.iconType.deleteIconType({ typeId: iconType.id! })

  update = (iconType: API.IconTypeVo) => Api.iconType.updateIconType(iconType)
}
