import type { PageListQueryParams, TypeManager } from '../config'
import Api from '@/api/api'

export class IconTypeManager implements TypeManager<API.IconTypeVo> {
  get info() {
    return {
      label: '图标类型',
    }
  }

  list = (params: PageListQueryParams) => Api.iconType.listIconType(params)

  create = (iconType: API.IconTypeVo) => Api.iconType.addIconType(iconType)

  delete = (iconType: API.IconTypeVo) => Api.iconType.deleteIconType({ typeId: iconType.id! })

  update = (iconType: API.IconTypeVo) => Api.iconType.updateIconType(iconType)
}
