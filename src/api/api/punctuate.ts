import { request } from '@/utils';

/** 提交暂存点位（不含额外字段） 成功则返回打点提交ID PUT /punctuate/single */
export async function addSinglePunctuate(
  body: API.MarkerSinglePunctuateVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>(`/api/punctuate/single`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改自身未提交的暂存点位（不包括额外字段） 根据点位ID修改点位 POST /punctuate/single */
export async function updateSelfSinglePunctuate(
  body: API.MarkerSinglePunctuateVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/punctuate/single`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 将暂存点位提交审核 将暂存点位提交审核 PUT /punctuate/push/${param0} */
export async function pushPunctuate(
  params: {
    // path
    authorId: number;
  },
  options?: { [key: string]: any },
) {
  const { authorId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/punctuate/push/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 提交暂存点位额外字段 在涉及的所有点位已经暂存后在使用该api PUT /punctuate/extra */
export async function addExtraPunctuate(
  body: API.MarkerExtraPunctuateVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/punctuate/extra`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改自身未提交的暂存点位的额外字段 根据点位ID修改点位 POST /punctuate/extra */
export async function updateSelfPunctuateExtra(
  body: API.MarkerExtraPunctuateVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/punctuate/extra`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页查询所有打点信息 分页查询所有打点信息 POST /punctuate/get/page */
export async function listPunctuatePage(
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoMarkerPunctuateVo>(`/api/punctuate/get/page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页查询自己提交的未通过的打点信息（不包含额外字段） 分页查询自己提交的未通过的打点信息（不包含额外字段）（打点员的API） POST /punctuate/get/page_single/${param0} */
export async function listSelfSinglePunctuatePage(
  params: {
    // path
    authorId: number;
  },
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  const { authorId: param0, ...queryParams } = params;
  return request<API.RPageListVoMarkerSinglePunctuateVo>(
    `/api/punctuate/get/page_single/${param0}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** 分页查询自己提交的未通过的打点信息（只包含额外字段） 分页查询自己提交的未通过的打点信息（只包含额外字段） （打点员的API） POST /punctuate/get/page_extra/${param0} */
export async function listSelfExtraPunctuatePage(
  params: {
    // path
    authorId: number;
  },
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  const { authorId: param0, ...queryParams } = params;
  return request<API.RPageListVoMarkerExtraPunctuateVo>(
    `/api/punctuate/get/page_extra/${param0}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    },
  );
}

/** 删除自己未通过的提交点位 根据提交ID列表来删除提交点位，会对打点员ID进行校验 DELETE /punctuate/delete/${param1}/${param0} */
export async function deleteSelfPunctuate(
  params: {
    // path
    punctuateId: number;
    authorId: number;
  },
  options?: { [key: string]: any },
) {
  const { punctuateId: param0, authorId: param1, ...queryParams } = params;
  return request<API.RBoolean>(`/api/punctuate/delete/${param1}/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
