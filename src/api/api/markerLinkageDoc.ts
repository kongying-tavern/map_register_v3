import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 通过bz2返回所有点位关联列表 查询所有点位关联列表，返回bz2压缩格式的byte数组 GET /api/marker_linkage_doc/all_list_bz2 */
export async function listAllMarkerLinkageBz2(options?: AxiosRequestConfig) {
  return request<string[]>('/api/marker_linkage_doc/all_list_bz2', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回所有点位关联列表bz2的md5 返回所有点位关联列表bz2的md5 GET /api/marker_linkage_doc/all_list_bz2_md5 */
export async function listAllMarkerLinkageBz2MD5(options?: AxiosRequestConfig) {
  return request<API.RString>('/api/marker_linkage_doc/all_list_bz2_md5', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 通过bz2返回所有点位关联有向图数据 查询所有点位关联有向图数据，返回bz2压缩格式的byte数组 GET /api/marker_linkage_doc/all_graph_bz2 */
export async function graphAllMarkerLinkageBz2(options?: AxiosRequestConfig) {
  return request<string[]>('/api/marker_linkage_doc/all_graph_bz2', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回所有点位关联有向图数据bz2的md5 返回所有点位关联有向图数据bz2的md5 GET /api/marker_linkage_doc/all_graph_bz2_md5 */
export async function graphAllMarkerLinkageBz2MD5(options?: AxiosRequestConfig) {
  return request<API.RString>('/api/marker_linkage_doc/all_graph_bz2_md5', {
    method: 'GET',
    ...(options || {}),
  })
}
