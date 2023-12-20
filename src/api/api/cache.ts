import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 删除公告缓存 删除公告缓存 DELETE /api/cache/notice */
export async function cleanNoticeCache(options?: AxiosRequestConfig) {
  return request<API.RBoolean>('/api/cache/notice', {
    method: 'DELETE',
    ...(options || {}),
  })
}

/** 删除全部点位缓存 删除点位缓存 DELETE /api/cache/marker */
export async function cleanMarkerCache(options?: AxiosRequestConfig) {
  return request<API.RBoolean>('/api/cache/marker', {
    method: 'DELETE',
    ...(options || {}),
  })
}

/** 删除全部点位关联缓存 删除点位关联缓存 DELETE /api/cache/marker_link */
export async function cleanMarkerLinkageCache(options?: AxiosRequestConfig) {
  return request<API.RBoolean>('/api/cache/marker_link', {
    method: 'DELETE',
    ...(options || {}),
  })
}

/** 删除全部物品缓存 删除物品缓存 DELETE /api/cache/item */
export async function cleanItemCache(options?: AxiosRequestConfig) {
  return request<API.RBoolean>('/api/cache/item', {
    method: 'DELETE',
    ...(options || {}),
  })
}

/** 删除标签缓存 list为空则删除所有标签缓存 DELETE /api/cache/iconTag */
export async function cleanIconTagCache(
  body: string[],
  options?: AxiosRequestConfig,
) {
  return request<API.RBoolean>('/api/cache/iconTag', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除全部公用物品缓存 删除公用物品缓存 DELETE /api/cache/commonItem */
export async function cleanCommonItemCache(options?: AxiosRequestConfig) {
  return request<API.RBoolean>('/api/cache/commonItem', {
    method: 'DELETE',
    ...(options || {}),
  })
}

/** 删除地区缓存 删除地区缓存 DELETE /api/cache/area */
export async function cleanAreaCache(options?: AxiosRequestConfig) {
  return request<API.RBoolean>('/api/cache/area', {
    method: 'DELETE',
    ...(options || {}),
  })
}
