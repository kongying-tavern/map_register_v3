import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 提交暂存点位 成功则返回打点提交ID PUT /api/punctuate/ */
export async function addPunctuate(
  body: API.MarkerPunctuateVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RLong>('/api/punctuate/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 修改自身未提交的暂存点位 根据点位ID修改点位 POST /api/punctuate/ */
export async function updateSelfPunctuate(
  body: API.MarkerPunctuateVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RBoolean>('/api/punctuate/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 将暂存点位提交审核 将暂存点位提交审核 PUT /api/punctuate/push/${param0} */
export async function pushPunctuate(
  params: {
    // path
    authorId: number
  },
  options?: AxiosRequestConfig,
) {
  const { authorId: param0, ...queryParams } = params
  return request<API.RBoolean>(`/api/punctuate/push/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 分页查询所有打点信息 分页查询所有打点信息 POST /api/punctuate/get/page */
export async function listPunctuatePage(
  body: API.PageSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RPageListVoMarkerPunctuateVo>('/api/punctuate/get/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页查询自己提交的未通过的打点信息 分页查询自己提交的未通过的打点信息（打点员的API） POST /api/punctuate/get/page/${param0} */
export async function listSelfPunctuatePage(
  params: {
    // path
    authorId: number
  },
  body: API.PageSearchVo,
  options?: AxiosRequestConfig,
) {
  const { authorId: param0, ...queryParams } = params
  return request<API.RPageListVoMarkerPunctuateVo>(`/api/punctuate/get/page/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  })
}

/** 删除自己未通过的提交点位 根据提交ID列表来删除提交点位，会对打点员ID进行校验 DELETE /api/punctuate/delete/${param1}/${param0} */
export async function deleteSelfPunctuate(
  params: {
    // path
    punctuateId: number
    authorId: number
  },
  options?: AxiosRequestConfig,
) {
  const { punctuateId: param0, authorId: param1, ...queryParams } = params
  return request<API.RBoolean>(`/api/punctuate/delete/${param1}/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}
