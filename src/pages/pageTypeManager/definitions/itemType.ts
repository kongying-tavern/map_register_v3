import type { PageListQueryParams, TypeManager } from '../config'
import Api from '@/api/api'

export class ItemTypeManager implements TypeManager<API.ItemTypeVo> {
  get info() {
    return {
      label: '物品类型',
    }
  }

  getId = (data: API.ItemTypeVo) => data.id

  getName = (data: API.ItemTypeVo) => `${data.name ?? `(id:${data.id})`}`

  getIsLeaf = (data: API.ItemTypeVo) => data.isFinal

  list = (params: PageListQueryParams<API.ItemTypeVo>) => {
    const { node, ...rest } = params
    return Api.itemType.listItemType1({ self: 1 }, {
      typeIdList: node === undefined ? [-1] : [node.id!],
      ...rest,
    })
  }

  create = (data: API.ItemTypeVo, parent?: API.ItemTypeVo) => {
    const { name, content = '', iconTag = '', sortIndex, hiddenFlag } = data
    return Api.itemType.addItemType({
      name,
      content,
      iconTag,
      sortIndex,
      hiddenFlag,
      parentId: parent?.id ?? -1,
    })
  }

  delete = (data: API.ItemTypeVo) => Api.itemType.deleteItemType({ itemTypeId: data.id! })

  update = (data: API.ItemTypeVo) => Api.itemType.updateItemType(data)
}
