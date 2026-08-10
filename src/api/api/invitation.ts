import type { AxiosRequestConfig } from 'axios'
import type { RBoolean, RPageListVoSysUserInvitationVo, RSysUserInvitationConsumeResultVo, RSysUserInvitationSmallVo, SysUserInvitationConsumeVo, SysUserInvitationSearchVo, SysUserInvitationSmallVo, SysUserInvitationVo } from '../alova/globals'
import { request } from '@/utils'

/** 新增/更新用户邀请 新增/更新用户邀请 POST /system/invitation/update */
export async function updateInvitation(
  body: SysUserInvitationVo,
  options?: AxiosRequestConfig,
) {
  return request<RSysUserInvitationSmallVo>('/system/invitation/update', {
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
  body: SysUserInvitationSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<RPageListVoSysUserInvitationVo>('/system/invitation/list', {
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
  body: SysUserInvitationSmallVo,
  options?: AxiosRequestConfig,
) {
  return request<RSysUserInvitationSmallVo>('/system/invitation/info', {
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
  body: SysUserInvitationConsumeVo,
  options?: AxiosRequestConfig,
) {
  return request<RSysUserInvitationConsumeResultVo>('/system/invitation/consume', {
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
  return request<RBoolean>(`/system/invitation/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}
