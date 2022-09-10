import type { JSONSchema } from 'json-schema-to-typescript'

export type ApifoxHttpMethods = 'post' | 'get' | 'put' | 'delete' | 'options'

export interface ApifoxObjectBase {
  auth?: {
    type: string
    bearer: {
      token: string
    }
  }
  id: number
  name: string
  ordering: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  description?: string
  projectId?: number
  folderId?: number
  creatorId?: number
  editorId?: number
}

export interface UpdateApiDtsOptions {
  /** api 文档 id */
  id: string
  /** 登录密码 */
  password: srtring
}

export interface ApiFolders extends ApifoxObjectBase {
  children: string[]
  preProcessors: unknown[]
  postProcessors: unknown[]
  type: 'root' | 'http'
  parentId: number
  serverId: string
}

export interface ApifoxDocData {
  apiFolders: Record<string, any>
  auth: boolean
  environments: Record<string, any>
  expiredAt?: string
  favicon?: string
  icon?: string
  id: string
  language: string
  name: string
  options: {
    collapseTopFolder: boolean
    isShowMaintainer: boolean
    isShowUpdatedAt: boolean
    isShowPrefixUrl: boolean
  }
  projectId: number
  teamId: number
}

export interface ApifoxDocResponse<T> {
  data: T
  success: boolean
}

export interface ApiTree {
  doc?: {
    content: string
    folderId: number
    id: number
  }
  folder?: {
    id: number
    parentId: number
    type: 'http'
  }
  api?: {
    folderId: number
    id: number
    method: 'post' | 'get' | 'put' | 'delete'
    path: string
    responsibleId: number
    status: 'developing'
    tags: unknown[]
    type: 'http'
  }
  children?: ApiTree[]
  key: string
  name: string
  type: 'doc' | 'apiDetailFolder' | 'apiDetail'
}

export interface ApifoxJSONSchema extends JSONSchema {
  'x-apifox-overrides'?: Record<string, ApifoxJSONSchema>
  'x-apifox-refs'?: Record<string, ApifoxJSONSchema>
  'x-apifox-orders'?: string[]
}

export interface ApiDetailResponse extends ApifoxObjectBase {
  jsonSchema: ApifoxJSONSchema
  defaultEnable: boolean
  apiDetailId: number
  projectId: number
  code: 200
  contentType: string
}

export interface ApiDetail extends ApifoxObjectBase {
  tags: unknown[]
  status: 'developing'
  requestBody: {
    type: 'application/json'
    parameters: []
    jsonSchema: ApifoxJSONSchema
  }
  parameters: {
    path: unknown[]
    query: unknown[]
    cookie: unknown[]
    header: unknown[]
  }
  commonParameters: {
    query: unknown[]
    body: unknown[]
    cookie: unknown[]
    header: unknown[]
  }
  auth: Record<string, any>
  commonResponseStatus: Record<string, any>
  advancedSettings: Record<string, any>
  mockScript: Record<string, any>
  type: 'http'
  serverId: string
  operationId: string
  sourceUrl: string
  method: ApifoxHttpMethods
  path: string
  customApiFields?: string
  responsibleId?: number
  responses: ApiDetailResponse[]
  responseExamples: unknown[]
}

export interface DataSchema extends ApifoxObjectBase {
  jsonSchema: ApifoxJSONSchema
}
