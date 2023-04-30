import { request } from '@/utils';

/** 新增分类 类型id在创建后返回 PUT /api/tag_type/add */
export async function addTagType(body: API.TagTypeVo, options?: { [key: string]: any }) {
  return request<API.RLong>('/api/tag_type/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改分类 由类型ID来定位修改一个分类 POST /api/tag_type/update */
export async function updateTagType(
  body: API.TagTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/api/tag_type/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 列出分类 列出标签的分类，parentID为-1的时候为列出所有的根分类，isTraverse为1时遍历所有子分类，默认为1，可分页 POST /api/tag_type/get/list */
export async function listTagType(
  body: API.PageAndTypeSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoTagTypeVo>('/api/tag_type/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除分类 这个操作会递归删除，请在前端做二次确认 DELETE /api/tag_type/delete/${param0} */
export async function deleteTagType(
  params: {
    // path
    typeId: number;
  },
  options?: { [key: string]: any },
) {
  const { typeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/tag_type/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
