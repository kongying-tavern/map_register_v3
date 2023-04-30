import { request } from '@/utils';

/** 返回可用角色列表 返回可用角色列表 GET /system/role/list */
export async function listRole(options?: { [key: string]: any }) {
  return request<API.RListSysRoleVo>('/system/role/list', {
    method: 'GET',
    ...(options || {}),
  });
}
