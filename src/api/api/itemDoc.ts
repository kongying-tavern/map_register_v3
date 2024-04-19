import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 返回所有物品信息 查询所有物品信息，返回压缩格式的byte数组 GET /api/item_doc/all_bin */
export async function listAllItemBinary(options?: AxiosRequestConfig) {
  return request<string[]>('/api/item_doc/all_bin', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回所有物品信息的md5 返回所有物品信息的md5 GET /api/item_doc/all_bin_md5 */
export async function listAllItemBinaryMd5(options?: AxiosRequestConfig) {
  return request<API.RString>('/api/item_doc/all_bin_md5', {
    method: 'GET',
    ...(options || {}),
  })
}
