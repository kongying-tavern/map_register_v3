import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 新增/更新用户邀请 新增/更新用户邀请 POST /system/invitation/update */
export async function updateInvitation(
  body: API.SysUserInvitationVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RSysUserInvitationSmallVo>('/system/invitation/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 列出用户邀请 列出用户邀请 POST /system/invitation/list */
export async function listInvitation(
  body: API.SysUserInvitationSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RPageListVoSysUserInvitationVo>('/system/invitation/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 检查用户邀请数据 检查用户邀请数据 POST /system/invitation/info */
export async function checkInvitation(
  body: API.SysUserInvitationSmallVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RSysUserInvitationSmallVo>('/system/invitation/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 检查用户邀请数据 检查用户邀请数据 POST /system/invitation/consume */
export async function consumeInvitation(
  body: API.SysUserInvitationConsumeVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RSysUserInvitationConsumeResultVo>('/system/invitation/consume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除用户邀请 删除用户邀请 DELETE /system/invitation/${param0} */
export async function deleteInvitation(
  params: {
    // path
    invitationId: number
  },
  options?: AxiosRequestConfig,
) {
  const { invitationId: param0, ...queryParams } = params
  return request<API.RBoolean>(`/system/invitation/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}
