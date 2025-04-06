import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 返回物品分页的md5数组 返回物品分页的md5数组 GET /api/item_doc/list_page_bin_md5 */
export async function listItemBinaryMD5(options?: AxiosRequestConfig) {
  return request<API.RListBinaryMD5Vo>('/api/item_doc/list_page_bin_md5', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 返回物品分页 查询分页物品信息，返回压缩格式的byte数组 GET /api/item_doc/list_page_bin/${param0} */
export async function listPageItemByBinary(
  params: {
    // path
    md5: string
  },
  options?: AxiosRequestConfig,
) {
  const { md5: param0, ...queryParams } = params
  return request<string[]>(`/api/item_doc/list_page_bin/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}
