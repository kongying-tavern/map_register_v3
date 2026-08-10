import type { AxiosRequestConfig } from 'axios'
import type { RBinaryMD5Vo } from '../alova/globals'
import { request } from '@/utils'

/** 获取所有图标信息的压缩 查询所有图标信息，返回压缩格式的byte数组 GET /api/icon_doc/all_bin */
export async function listAllIconBinary(options?: AxiosRequestConfig) {
  return request<string[]>('/api/icon_doc/all_bin', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回所有图标信息的md5 返回所有图标信息的md5 GET /api/icon_doc/all_bin_md5 */
export async function listAllIconBinaryMd5(options?: AxiosRequestConfig) {
  return request<RBinaryMD5Vo>('/api/icon_doc/all_bin_md5', {
    method: 'GET',
    ...(options || {}),
  })
}
