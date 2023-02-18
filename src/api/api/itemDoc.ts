import { request } from '@/utils';

/** 通过bz2返回所有物品信息 查询所有物品信息，返回bz2压缩格式的byte数组 GET /api/item_doc/all_bz2 */
export async function listAllItemBz2(options?: { [key: string]: any }) {
  return request<string[]>('/api/item_doc/all_bz2', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 返回所有物品信息bz2的md5 返回所有物品信息bz2的md5 GET /api/item_doc/all_bz2_md5 */
export async function listAllItemBz2Md5(options?: { [key: string]: any }) {
  return request<API.RString>('/api/item_doc/all_bz2_md5', {
    method: 'GET',
    ...(options || {}),
  });
}
