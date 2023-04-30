import { request } from '@/utils';

/** 新增分类 类型id在创建后返回 PUT /api/icon_type/add */
export async function addIconType(
  body: API.IconTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>('/api/icon_type/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改分类 由类型ID来定位修改一个分类 POST /api/icon_type/update */
export async function updateIconType(
  body: API.IconTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/api/icon_type/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 列出分类 列出图标的分类，parentID为-1的时候为列出所有的根分类，isTraverse为1时遍历所有子分类，默认为1，可分页 POST /api/icon_type/get/list */
export async function listIconType(
  body: API.PageAndTypeSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoIconTypeVo>('/api/icon_type/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除分类 这个操作会递归删除，请在前端做二次确认 DELETE /api/icon_type/delete/${param0} */
export async function deleteIconType(
  params: {
    // path
    typeId: number;
  },
  options?: { [key: string]: any },
) {
  const { typeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/icon_type/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
