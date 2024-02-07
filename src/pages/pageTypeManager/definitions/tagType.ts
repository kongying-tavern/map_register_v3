import type { PageListQueryParams, TypeManager } from '../config'
import Api from '@/api/api'

export class TagTypeManager implements TypeManager<API.TagTypeVo> {
  get info() {
    return {
      label: '标签类型',
    }
  }

  list = (params: PageListQueryParams) => Api.tagType.listTagType(params)

  create = (tagType: API.TagTypeVo) => Api.tagType.addTagType(tagType)

  delete = (tagType: API.TagTypeVo) => Api.tagType.deleteTagType({ typeId: tagType.id! })

  update = (tagType: API.TagTypeVo) => Api.tagType.updateTagType(tagType)
}
