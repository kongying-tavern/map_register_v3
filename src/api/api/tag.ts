import { request } from '@/utils';

/** 创建标签 只创建一个空标签 PUT /tag/${param0} */
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

/** 删除标签 需要确保已经没有条目在使用这个标签，否则会删除失败 DELETE /tag/${param0} */
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

/** 新增分类 类型id在创建后返回 PUT /tag/type */
export async function addTagType(body: API.TagTypeVo, options?: { [key: string]: any }) {
  return request<API.RLong>(`/api/tag/type`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改分类 由类型ID来定位修改一个分类 POST /tag/type */
export async function updateTagType(
  body: API.TagTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/tag/type`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改标签关联 将标签关联到另一个图标上 POST /tag/${param0}/${param1} */
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

/** 修改标签的分类信息 本接口仅在后台使用，故分离出来 POST /tag/updateType */
export async function updateTypeInTag(body: API.TagVo, options?: { [key: string]: any }) {
  return request<API.RBoolean>(`/api/tag/updateType`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 列出分类 列出标签的分类，parentID为-1的时候为列出所有的根分类，isTraverse为1时遍历所有子分类，默认为1，可分页 POST /tag/get/type/list */
export async function listTagType(
  body: API.PageAndTypeListVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoTagTypeVo>(`/api/tag/get/type/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取单个标签信息 获取单个标签信息 POST /tag/get/single/${param0} */
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

/** 列出标签 可按照分类进行查询，也可给出需要查询url的tag名称列表，可分页 POST /tag/get/list */
export async function listTag(body: API.TagSearchVo, options?: { [key: string]: any }) {
  return request<API.RPageListVoTagVo>(`/api/tag/get/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取所有标签信息的bz2压缩 查询所有标签信息，返回bz2压缩格式的byte数组 GET /tag/get/all_bz2 */
export async function listAllTagBz2(options?: { [key: string]: any }) {
  return request<string[]>(`/api/tag/get/all_bz2`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 返回所有标签信息bz2的md5 返回所有标签信息bz2的md5 GET /tag/get/all_bz2_md5 */
export async function listAllTagBz2Md5(options?: { [key: string]: any }) {
  return request<API.RString>(`/api/tag/get/all_bz2_md5`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 删除分类 这个操作会递归删除，请在前端做二次确认 DELETE /tag/type/${param0} */
export async function deleteTagType(
  params: {
    // path
    typeId: number;
  },
  options?: { [key: string]: any },
) {
  const { typeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/tag/type/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
