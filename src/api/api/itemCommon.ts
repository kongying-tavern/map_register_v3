import { request } from '@/utils';

/** 新增地区公用物品 通过ID列表批量添加地区公用物品 PUT /api/item_common/add */
export async function addCommonItem(body: number[], options?: { [key: string]: any }) {
  return request<API.RBoolean>('/api/item_common/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 列出地区公用物品 列出地区公用物品 POST /api/item_common/get/list */
export async function listCommonItem(
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoItemAreaPublicVo>('/api/item_common/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除地区公用物品 通过ID列表批量删除地区公用物品 DELETE /api/item_common/delete/${param0} */
export async function deleteCommonItem(
  params: {
    // path
    itemId: number;
  },
  options?: { [key: string]: any },
) {
  const { itemId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/item_common/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
