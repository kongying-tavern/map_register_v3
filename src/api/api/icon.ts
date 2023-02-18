import { request } from '@/utils';

/** 新增图标 无需指定icon的id，id由系统自动生成并在响应中返回,一组name和updater需要唯一（允许单一重复） PUT /api/icon/add */
export async function createIcon(body: API.IconVo, options?: { [key: string]: any }) {
  return request<API.RLong>('/api/icon/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改图标信息 由icon_id定位修改一个icon POST /api/icon/update */
export async function updateIcon(body: API.IconVo, options?: { [key: string]: any }) {
  return request<API.RBoolean>('/api/icon/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取单个图标信息 获取单个图标信息 POST /api/icon/get/single/${param0} */
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

/** 列出图标 可按照分类和上传者进行查询，也可根据ID批量查询，可分页 POST /api/icon/get/list */
export async function listIcon(body: API.IconSearchVo, options?: { [key: string]: any }) {
  return request<API.RPageListVoIconVo>('/api/icon/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除图标 删除图标 DELETE /api/icon/delete/${param0} */
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
