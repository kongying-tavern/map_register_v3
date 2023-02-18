import { request } from '@/utils';

/** 删除全部点位缓存 删除点位缓存 DELETE /api/cache/marker */
export async function cleanMarkerCache(options?: { [key: string]: any }) {
  return request<API.RBoolean>('/api/cache/marker', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 删除全部物品缓存 删除物品缓存 DELETE /api/cache/item */
export async function cleanItemCache(options?: { [key: string]: any }) {
  return request<API.RBoolean>('/api/cache/item', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 删除标签缓存 list为空则删除所有标签缓存 DELETE /api/cache/iconTag */
export async function cleanIconTagCache(
  body: string[],
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/api/cache/iconTag', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除全部公用物品缓存 删除公用物品缓存 DELETE /api/cache/commonItem */
export async function cleanCommonItemCache(options?: { [key: string]: any }) {
  return request<API.RBoolean>('/api/cache/commonItem', {
    method: 'DELETE',
    ...(options || {}),
  });
}
