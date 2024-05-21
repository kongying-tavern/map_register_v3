import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 返回点位分页的md5数组 返回点位分页的md5数组 GET /api/marker_doc/list_page_bin_md5 */
export async function listMarkerBinaryMD5(options?: AxiosRequestConfig) {
  return request<API.RListString>('/api/marker_doc/list_page_bin_md5', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回点位分页 查询分页点位信息，返回压缩格式的byte数组 GET /api/marker_doc/list_page_bin/${param0} */
export async function listPageMarkerByBinary(
  params: {
    // path
    md5: string
  },
  options?: AxiosRequestConfig,
) {
  const { md5: param0, ...queryParams } = params
  return request<string[]>(`/api/marker_doc/list_page_bin/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}
