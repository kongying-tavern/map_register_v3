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

  getId: (node: T) => string | number | undefined

  getName: (node: T) => string

  getIsLeaf: (node: T) => boolean | undefined

  list: (params: PageListQueryParams<T>) => Promise<PageListResponse<T>>

  create: (node: T, parent?: T) => Promise<unknown>

  delete: (node: T) => Promise<unknown>

  update: (node: T) => Promise<unknown>
}
