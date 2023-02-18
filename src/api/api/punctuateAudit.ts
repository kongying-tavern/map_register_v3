import { request } from '@/utils';

/** 驳回点位审核 驳回的点位和通过额外字段关联的点位会回到暂存区 POST /api/punctuate_audit/reject/${param0} */
export async function rejectPunctuate(
  params: {
    // path
    punctuateId: number;
  },
  body: string,
  options?: { [key: string]: any },
) {
  const { punctuateId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/punctuate_audit/reject/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 通过点位审核 通过审核，返回点位ID（如果是新建点位，则为新点位ID），通过额外字段关联的点位也会自动通过审核（但不会返回关联点位的ID） POST /api/punctuate_audit/pass/${param0} */
export async function passPunctuate(
  params: {
    // path
    punctuateId: number;
  },
  options?: { [key: string]: any },
) {
  const { punctuateId: param0, ...queryParams } = params;
  return request<API.RLong>(`/api/punctuate_audit/pass/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页查询所有打点信息（包括暂存） 分页查询所有打点信息（包括暂存） POST /api/punctuate_audit/get/page/all */
export async function listAllPunctuatePage(
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoMarkerPunctuateVo>('/api/punctuate_audit/get/page/all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据各种条件筛选打点信息 支持根据末端地区、末端类型、物品、提交者来进行查询，地区、类型、物品查询不能同时生效，同时存在时报错 POST /api/punctuate_audit/get/list_byinfo */
export async function searchPunctuate(
  body: API.PunctuateSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RListMarkerPunctuateVo>('/api/punctuate_audit/get/list_byinfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 通过打点ID列表查询打点信息 通过打点ID列表查询打点信息 POST /api/punctuate_audit/get/list_byid */
export async function listPunctuateById(
  body: number[],
  options?: { [key: string]: any },
) {
  return request<API.RListMarkerPunctuateVo>('/api/punctuate_audit/get/list_byid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据各种条件筛选打点ID 支持根据末端地区、末端类型、物品、提交者来进行查询，地区、类型、物品查询不能同时生效，同时存在时报错 POST /api/punctuate_audit/get/id */
export async function searchPunctuateId(
  body: API.PunctuateSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RListLong>('/api/punctuate_audit/get/id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除提交点位 根据提交ID列表来删除提交点位 DELETE /api/punctuate_audit/delete/${param0} */
export async function deletePunctuate(
  params: {
    // path
    punctuateId: number;
  },
  options?: { [key: string]: any },
) {
  const { punctuateId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/punctuate_audit/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
