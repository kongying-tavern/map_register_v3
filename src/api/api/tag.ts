import { request } from '@/utils';

/** 创建标签 只创建一个空标签 PUT /api/tag/${param0} */
export async function createTag(
  params: {
    // path
    tagName: string;
  },
  options?: { [key: string]: any },
) {
  const { tagName: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/tag/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除标签 需要确保已经没有条目在使用这个标签，否则会删除失败 DELETE /api/tag/${param0} */
export async function deleteTag(
  params: {
    // path
    tagName: string;
  },
  options?: { [key: string]: any },
) {
  const { tagName: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/tag/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 修改标签关联 将标签关联到另一个图标上 POST /api/tag/${param0}/${param1} */
export async function updateTag(
  params: {
    // path
    tagName: string;
    iconId: number;
  },
  options?: { [key: string]: any },
) {
  const { tagName: param0, iconId: param1, ...queryParams } = params;
  return request<API.RBoolean>(`/api/tag/${param0}/${param1}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 修改标签的分类信息 本接口仅在后台使用，故分离出来 POST /api/tag/updateType */
export async function updateTypeInTag(body: API.TagVo, options?: { [key: string]: any }) {
  return request<API.RBoolean>('/api/tag/updateType', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取单个标签信息 获取单个标签信息 POST /api/tag/get/single/${param0} */
export async function getTag(
  params: {
    // path
    name: string;
  },
  options?: { [key: string]: any },
) {
  const { name: param0, ...queryParams } = params;
  return request<API.RTagVo>(`/api/tag/get/single/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 列出标签 可按照分类进行查询，也可给出需要查询url的tag名称列表，可分页 POST /api/tag/get/list */
export async function listTag(body: API.TagSearchVo, options?: { [key: string]: any }) {
  return request<API.RPageListVoTagVo>('/api/tag/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
