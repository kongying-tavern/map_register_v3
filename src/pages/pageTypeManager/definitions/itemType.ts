import type { PageListQueryParams, TypeManager } from '../config'
import Api from '@/api/api'

export class ItemTypeManager implements TypeManager<API.ItemTypeVo> {
  get info() {
    return {
      label: '物品类型',
    }
  }

  list = (params: PageListQueryParams) => Api.itemType.listItemType1({ self: 1 }, {
    ...params,
    typeIdList: params.typeIdList ? params.typeIdList : [-1],
  })

  create = (itemType: API.ItemTypeVo) => Api.itemType.addItemType(itemType)

  delete = (itemType: API.ItemTypeVo) => Api.itemType.deleteItemType({ itemTypeId: itemType.id! })

  update = (itemType: API.ItemTypeVo) => Api.itemType.updateItemType(itemType)
}
