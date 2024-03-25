import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 返回点位分页bz2的md5数组 返回点位分页bz2的md5数组 GET /api/marker_doc/list_page_bz2_md5 */
export async function listMarkerBz2MD5(
  params: NonNullable<unknown>,
  options?: AxiosRequestConfig,
) {
  return request<API.RListString>('/api/marker_doc/list_page_bz2_md5', {
    method: 'GET',
    headers: {},
    params: { ...params },
    ...(options || {}),
  })
}

/** 通过bz2返回点位分页 查询分页点位信息，返回bz2压缩格式的byte数组 GET /api/marker_doc/list_page_bz2/${param0} */
export async function listPageMarkerBy7zip(
  params: { // path
    md5: string
  },
  options?: AxiosRequestConfig,
) {
  const { md5: param0, ...queryParams } = params
  return request<string[]>(`/api/marker_doc/list_page_bz2/${param0}`, {
    method: 'GET',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  })
}
