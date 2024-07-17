import type { PageListQueryParams, TypeManager } from '../config'
import Api from '@/api/api'

export class ItemTypeManager implements TypeManager<API.ItemTypeVo> {
  get info() {
    return {
      label: '物品类型',
    }
  }

  getKey = (data: API.ItemTypeVo) => `${data.id}`

  getName = (data: API.ItemTypeVo) => `${data.name ?? `(id:${data.id})`}`

  list = (params: PageListQueryParams<API.ItemTypeVo>) => {
    const { node, ...rest } = params
    return Api.itemType.listItemType1({ self: 1 }, {
      typeIdList: node === undefined ? [-1] : [node.id!],
      ...rest,
    })
  }

  create = (itemType: API.ItemTypeVo) => Api.itemType.addItemType(itemType)

  delete = (itemType: API.ItemTypeVo) => Api.itemType.deleteItemType({ itemTypeId: itemType.id! })

  update = (itemType: API.ItemTypeVo) => Api.itemType.updateItemType(itemType)
}
