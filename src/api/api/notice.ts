import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 新增公告 返回新增公告ID PUT /api/notice/add */
export async function createNotice(
  params: NonNullable<unknown>,
  body: API.NoticeVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RLong>('/api/notice/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  })
}

/** 修改公告 修改公告 POST /api/notice/update */
export async function updateNotice(
  params: NonNullable<unknown>,
  body: API.NoticeVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RBoolean>('/api/notice/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  })
}

/** 分页查询所有公告信息 分页查询所有点位信息 POST /api/notice/get/list */
export async function listNotice(
  body: API.NoticeSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RPageListVoNoticeVo>('/api/notice/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除公告 删除公告，请在前端做二次确认 DELETE /api/notice/${param0} */
export async function deleteNotice(
  params: { // path
    noticeId: number
  },
  options?: AxiosRequestConfig,
) {
  const { noticeId: param0, ...queryParams } = params
  return request<API.RBoolean>(`/api/notice/${param0}`, {
    method: 'DELETE',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  })
}
