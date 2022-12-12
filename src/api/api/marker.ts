import { request } from '@/utils';

/** 新增点位（不包括额外字段） 新增完成后返回点位ID PUT /marker/single */
export async function createMarker(
  body: API.MarkerSingleVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>(`/api/marker/single`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改点位（不包括额外字段） 根据点位ID修改点位 POST /marker/single */
export async function updateMarker(
  body: API.MarkerSingleVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/marker/single`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 提交暂存点位（不含额外字段） 成功则返回打点提交ID PUT /marker/punctuate/author/single */
export async function addSinglePunctuate(
  body: API.MarkerSinglePunctuateVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>(`/api/marker/punctuate/author/single`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改自身未提交的暂存点位（不包括额外字段） 根据点位ID修改点位 POST /marker/punctuate/author/single */
export async function updateSelfSinglePunctuate(
  body: API.MarkerSinglePunctuateVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/marker/punctuate/author/single`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 将暂存点位提交审核 将暂存点位提交审核 PUT /marker/punctuate/author/push/${param0} */
export async function pushPunctuate(
  params: {
    // path
    authorId: number;
  },
  options?: { [key: string]: any },
) {
  const { authorId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/marker/punctuate/author/push/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 提交暂存点位额外字段 在涉及的所有点位已经暂存后在使用该api PUT /marker/punctuate/author/extra */
export async function addExtraPunctuate(
  body: API.MarkerExtraPunctuateVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/marker/punctuate/author/extra`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改自身未提交的暂存点位的额外字段 根据点位ID修改点位 POST /marker/punctuate/author/extra */
export async function updateSelfPunctuateExtra(
  body: API.MarkerExtraPunctuateVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/marker/punctuate/author/extra`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 新增点位额外字段信息 需保证额外字段的点位都已经添加成功 PUT /marker/extra */
export async function addMarkerExtra(
  body: API.MarkerExtraVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/marker/extra`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改点位额外字段 根据点位ID修改点位额外字段 POST /marker/extra */
export async function updateMarkerExtra(
  body: API.MarkerExtraVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>(`/api/marker/extra`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 通过点位审核 通过审核，返回点位ID（如果是新建点位，则为新点位ID），通过额外字段关联的点位也会自动通过审核（但不会返回关联点位的ID） POST /marker/punctuate/check/ok/${param0} */
export async function passPunctuate(
  params: {
    // path
    punctuateId: number;
  },
  options?: { [key: string]: any },
) {
  const { punctuateId: param0, ...queryParams } = params;
  return request<API.RLong>(`/api/marker/punctuate/check/ok/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页查询所有打点信息（包括暂存） 分页查询所有打点信息（包括暂存） POST /marker/punctuate/check/get/page/all */
export async function listAllPunctuatePage(
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoMarkerPunctuateVo>(
    `/api/marker/punctuate/check/get/page/all`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** 根据各种条件筛选打点信息 支持根据末端地区、末端类型、物品、提交者来进行查询，地区、类型、物品查询不能同时生效，同时存在时报错 POST /marker/punctuate/check/get/list_byinfo */
export async function searchPunctuate(
  body: API.PunctuateSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RListMarkerPunctuateVo>(
    `/api/marker/punctuate/check/get/list_byinfo`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** 通过打点ID列表查询打点信息 通过打点ID列表查询打点信息 POST /marker/punctuate/check/get/list_byid */
export async function listPunctuateById(
  body: number[],
  options?: { [key: string]: any },
) {
  return request<API.RListMarkerPunctuateVo>(
    `/api/marker/punctuate/check/get/list_byid`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** 根据各种条件筛选打点ID 支持根据末端地区、末端类型、物品、提交者来进行查询，地区、类型、物品查询不能同时生效，同时存在时报错 POST /marker/punctuate/check/get/id */
export async function searchPunctuateId(
  body: API.PunctuateSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RListLong>(`/api/marker/punctuate/check/get/id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 驳回点位审核 驳回的点位和通过额外字段关联的点位会回到暂存区 POST /marker/punctuate/check/fail/${param0} */
export async function rejectPunctuate(
  params: {
    // path
    punctuateId: number;
  },
  options?: { [key: string]: any },
) {
  const { punctuateId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/marker/punctuate/check/fail/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页查询所有打点信息 分页查询所有打点信息 POST /marker/punctuate/author/get/page */
export async function listPunctuatePage(
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoMarkerPunctuateVo>(
    `/api/marker/punctuate/author/get/page`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** 分页查询自己提交的未通过的打点信息（不包含额外字段） 分页查询自己提交的未通过的打点信息（不包含额外字段）（打点员的API） POST /marker/punctuate/author/get/page_single/${param0} */
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
    `/api/marker/punctuate/author/get/page_single/${param0}`,
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

/** 分页查询自己提交的未通过的打点信息（只包含额外字段） 分页查询自己提交的未通过的打点信息（只包含额外字段） （打点员的API） POST /marker/punctuate/author/get/page_extra/${param0} */
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
    `/api/marker/punctuate/author/get/page_extra/${param0}`,
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

/** 分页查询所有点位信息 分页查询所有点位信息 POST /marker/get/page */
export async function listMarkerPage(
  params: {
    // header
},
  body: API.PageSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoMarkerVo>(`/api/marker/get/page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 根据各种条件筛选查询点位信息 支持根据末端地区、末端类型、物品来进行查询，三种查询不能同时生效，同时存在时报错，同时支持测试点位获取 POST /marker/get/list_byinfo */
export async function searchMarker(
  params: {
    // header
},
  body: API.MarkerSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RListMarkerVo>(`/api/marker/get/list_byinfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 通过ID列表查询点位信息 通过ID列表来进行查询点位信息 POST /marker/get/list_byid */
export async function listMarkerById(
  params: {
    // header
},
  body: number[],
  options?: { [key: string]: any },
) {
  return request<API.RListMarkerVo>(`/api/marker/get/list_byid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 根据各种条件筛选查询点位ID 支持根据末端地区、末端类型、物品来进行查询，三种查询不能同时生效，同时存在时报错，同时支持测试点位获取 POST /marker/get/id */
export async function searchMarkerId(
  params: {
    // header
},
  body: API.MarkerSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RListLong>(`/api/marker/get/id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 返回点位分页bz2的md5数组 返回点位分页bz2的md5数组 GET /marker/get/list_page_bz2_md5 */
export async function listMarkerBz2MD5(
  params: {
    // header
},
  options?: { [key: string]: any },
) {
  return request<API.RListString>(`/api/marker/get/list_page_bz2_md5`, {
    method: 'GET',
    headers: {},
    params: { ...params },
    ...(options || {}),
  });
}

/** 通过bz2返回点位分页 查询分页点位信息，返回bz2压缩格式的byte数组 GET /marker/get/list_page_bz2/${param0} */
export async function listPageMarkerBy7zip(
  params: {
    // header
// path
    index: number;
  },
  options?: { [key: string]: any },
) {
  const { index: param0, ...queryParams } = params;
  return request<string[]>(`/api/marker/get/list_page_bz2/${param0}`, {
    method: 'GET',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除点位 根据点位ID列表批量删除点位 DELETE /marker/${param0} */
export async function deleteMarker(
  params: {
    // path
    markerId: number;
  },
  options?: { [key: string]: any },
) {
  const { markerId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/marker/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除提交点位 根据提交ID列表来删除提交点位 DELETE /marker/punctuate/check/${param0} */
export async function deletePunctuate(
  params: {
    // path
    punctuateId: number;
  },
  options?: { [key: string]: any },
) {
  const { punctuateId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/api/marker/punctuate/check/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除自己未通过的提交点位 根据提交ID列表来删除提交点位，会对打点员ID进行校验 DELETE /marker/punctuate/author/${param1}/${param0} */
export async function deleteSelfPunctuate(
  params: {
    // path
    punctuateId: number;
    authorId: number;
  },
  options?: { [key: string]: any },
) {
  const { punctuateId: param0, authorId: param1, ...queryParams } = params;
  return request<API.RBoolean>(`/api/marker/punctuate/author/${param1}/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
