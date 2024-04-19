import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 获取所有标签信息的压缩 查询所有标签信息，返回压缩格式的byte数组 GET /api/tag_doc/all_bin */
export async function listAllTagBinary(options?: AxiosRequestConfig) {
  return request<string[]>('/api/tag_doc/all_bin', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回所有标签信息的md5 返回所有标签信息的md5 GET /api/tag_doc/all_bin_md5 */
export async function listAllTagBinaryMd5(options?: AxiosRequestConfig) {
  return request<API.RString>('/api/tag_doc/all_bin_md5', {
    method: 'GET',
    ...(options || {}),
  })
}
