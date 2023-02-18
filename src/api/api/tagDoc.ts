import { request } from '@/utils';

/** 获取所有标签信息的bz2压缩 查询所有标签信息，返回bz2压缩格式的byte数组 GET /api/tag_doc/all_bz2 */
export async function listAllTagBz2(options?: { [key: string]: any }) {
  return request<string[]>('/api/tag_doc/all_bz2', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 返回所有标签信息bz2的md5 返回所有标签信息bz2的md5 GET /api/tag_doc/all_bz2_md5 */
export async function listAllTagBz2Md5(options?: { [key: string]: any }) {
  return request<API.RString>('/api/tag_doc/all_bz2_md5', {
    method: 'GET',
    ...(options || {}),
  });
}
