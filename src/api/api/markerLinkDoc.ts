import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 返回所有点位关联列表 查询所有点位关联列表，返回压缩格式的byte数组 GET /api/marker_link_doc/all_list_bin */
export async function listAllMarkerLinkageBinary(options?: AxiosRequestConfig) {
  return request<string[]>('/api/marker_link_doc/all_list_bin', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回所有点位关联列表的md5 返回所有点位关联列表的md5 GET /api/marker_link_doc/all_list_bin_md5 */
export async function listAllMarkerLinkageBinaryMD5(options?: AxiosRequestConfig) {
  return request<API.RString>('/api/marker_link_doc/all_list_bin_md5', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回所有点位关联有向图数据 查询所有点位关联有向图数据，返回压缩格式的byte数组 GET /api/marker_link_doc/all_graph_bin */
export async function graphAllMarkerLinkageBinary(options?: AxiosRequestConfig) {
  return request<string[]>('/api/marker_link_doc/all_graph_bin', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回所有点位关联有向图数据的md5 返回所有点位关联有向图数据的md5 GET /api/marker_link_doc/all_graph_bin_md5 */
export async function graphAllMarkerLinkageBinaryMD5(options?: AxiosRequestConfig) {
  return request<API.RString>('/api/marker_link_doc/all_graph_bin_md5', {
    method: 'GET',
    ...(options || {}),
  })
}
