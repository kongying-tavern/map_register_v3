import type { PageListQueryParams, TypeManager } from '../config'
import Api from '@/api/api'

export class TagTypeManager implements TypeManager<API.TagTypeVo> {
  get info() {
    return {
      label: '图标类型',
    }
  }

  getId = (data: API.TagTypeVo) => data.id

  getName = (data: API.TagTypeVo) => `${data.name ?? `(id:${data.id})`}`

  getIsLeaf = (data: API.TagTypeVo) => data.isFinal

  list = (params: PageListQueryParams<API.IconTypeVo>) => {
    const { node, ...rest } = params
    return Api.tagType.listTagType({
      typeIdList: node === undefined ? [-1] : [node.id!],
      ...rest,
    })
  }

  create = (tagType: API.TagTypeVo, parent?: API.TagTypeVo) => {
    const { name } = tagType
    return Api.tagType.addTagType({
      name,
      parentId: parent?.id ?? -1,
    })
  }

  delete = (tagType: API.TagTypeVo) => Api.tagType.deleteTagType({ typeId: tagType.id! })

  update = (tagType: API.TagTypeVo) => Api.tagType.updateTagType(tagType)
}
