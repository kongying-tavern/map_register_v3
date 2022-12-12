import { request } from '@/utils';

/** 新增分类 类型id在创建后返回 PUT /icon/type */
export async function addIconType(
  body: API.IconTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>(`/api/icon/type`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改分类 由类型ID来定位修改一个分类 POST /icon/type */
export async function updateIconType(
  body: API.IconTypeVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/icon/type`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 新增图标 无需指定icon的id，id由系统自动生成并在响应中返回,一组name和updater需要唯一（允许单一重复） PUT /icon/add */
export async function createIcon(body: API.IconVo, options?: { [key: string]: any }) {
  return request<API.RLong>(`/api/icon/add`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改图标信息 由icon_id定位修改一个icon POST /icon/update */
export async function updateIcon(body: API.IconVo, options?: { [key: string]: any }) {
  return request<API.RBoolean>(`/api/icon/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 列出分类 列出图标的分类，parentID为-1的时候为列出所有的根分类，isTraverse为1时遍历所有子分类，默认为1，可分页 POST /icon/get/type/list */
export async function listIconType(
  body: API.PageAndTypeListVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoIconTypeVo>(`/api/icon/get/type/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取单个图标信息 获取单个图标信息 POST /icon/get/single/${param0} */
export async function getIcon(
  params: {
    // path
    iconId: number;
  },
  options?: { [key: string]: any },
) {
  const { iconId: param0, ...queryParams } = params;
  return request<API.RIconVo>(`/api/icon/get/single/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 列出图标 可按照分类和上传者进行查询，也可根据ID批量查询，可分页 POST /icon/get/list */
export async function listIcon(body: API.IconSearchVo, options?: { [key: string]: any }) {
  return request<API.RPageListVoIconVo>(`/api/icon/get/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除分类 这个操作会递归删除，请在前端做二次确认 DELETE /icon/type/${param0} */
export async function deleteIconType(
  params: {
    // path
    typeId: number;
  },
  options?: { [key: string]: any },
) {
  const { typeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/icon/type/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除图标 删除图标 DELETE /icon/delete/${param0} */
export async function deleteIcon(
  params: {
    // path
    iconId: number;
  },
  options?: { [key: string]: any },
) {
  const { iconId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/icon/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
