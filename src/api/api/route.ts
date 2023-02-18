import { request } from '@/utils';

/** 新增路线 返回新增路线ID PUT /api/route/add */
export async function createRoute(
  params: {
    // header
},
  body: API.RouteVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>('/api/route/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 修改路线 修改路线 POST /api/route */
export async function updateRoute(
  params: {
    // header
},
  body: API.RouteVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/api/route', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 根据条件筛选分页查询路线信息 根据条件筛选分页查询路线信息，会根据当前角色决定不同的显隐等级 POST /api/route/get/search */
export async function listRoutePageSearch(
  params: {
    // header
},
  body: API.RouteSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoRouteVo>('/api/route/get/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 分页查询所有路线信息 分页查询所有路线信息，会根据当前角色决定不同的显隐等级 POST /api/route/get/page */
export async function listRoutePage(
  params: {
    // header
},
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoRouteVo>('/api/route/get/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 根据id列表查询路线信息 根据id列表查询路线信息，会根据当前角色决定不同的显隐等级 POST /api/route/get/list_byid */
export async function listRouteById(
  params: {
    // header
},
  body: number[],
  options?: { [key: string]: any },
) {
  return request<API.RListRouteVo>('/api/route/get/list_byid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 删除路线 删除路线，请在前端做二次确认 DELETE /api/route/${param0} */
export async function deleteRoute(
  params: {
    // header
// path
    routeId: number;
  },
  options?: { [key: string]: any },
) {
  const { routeId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/route/${param0}`, {
    method: 'DELETE',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  });
}
