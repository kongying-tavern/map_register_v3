export interface PageListResponse<T> {
  data?: {
    record?: T[]
    total?: number
  }
  users?: Record<string, API.SysUserSmallVo>
}

export interface PageListQueryParams<T = unknown> {
  current?: number
  size?: number
  node?: T
}

export type TypeObject = API.ItemTypeVo & API.IconTypeVo & API.TagTypeVo & Record<string, unknown>

/** 实现类型表的增删改查所需要实现的方法 */
export interface TypeManager<T = unknown> {
  info: {
    label: string
  }

  getKey: (node: T) => string

  getName: (node: T) => string

  list: (params: PageListQueryParams<T>) => Promise<PageListResponse<T>>

  create: (node: T) => Promise<unknown>

  delete: (node: T) => Promise<unknown>

  update: (node: T) => Promise<unknown>
}
