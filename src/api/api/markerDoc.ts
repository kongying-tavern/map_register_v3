import { request } from '@/utils';

/** 返回点位分页bz2的md5数组 返回点位分页bz2的md5数组 GET /api/marker_doc/list_page_bz2_md5 */
export async function listMarkerBz2MD5(options?: { [key: string]: any }) {
  return request<API.RListString>('/api/marker_doc/list_page_bz2_md5', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 通过bz2返回点位分页 查询分页点位信息，返回bz2压缩格式的byte数组 GET /api/marker_doc/list_page_bz2/${param0} */
export async function listPageMarkerBy7zip(
  params: {
    // path
    index: number;
  },
  options?: { [key: string]: any },
) {
  const { index: param0, ...queryParams } = params;
  return request<string[]>(`/api/marker_doc/list_page_bz2/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
