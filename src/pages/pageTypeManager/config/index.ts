export interface PageListResponse<T extends Record<string, unknown>> {
  data?: {
    record?: T[]
    total?: number
  }
  users?: Record<string, API.SysUserSmallVo>
}

export interface PageListQueryParams {
  current?: number
  size?: number
  typeIdList?: number[]
}

export type TypeObject = API.ItemTypeVo & API.IconTypeVo & API.TagTypeVo & Record<string, unknown>

/** 实现类型表的增删改查所需要实现的方法 */
export abstract class TypeManager<T extends Record<string, unknown>> {
  abstract readonly info: {
    label: string
  }

  abstract list: (params: PageListQueryParams) => Promise<PageListResponse<T>>

  abstract create: (form: T) => Promise<unknown>

  abstract delete: (form: T) => Promise<unknown>

  abstract update: (form: T) => Promise<unknown>
}
