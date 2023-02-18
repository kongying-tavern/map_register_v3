import { request } from '@/utils';

/** 将角色赋予给用户 将角色赋予给用户 PUT /system/role/user */
export async function addRoleToUser(
  body: API.SysRoleLinkVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/system/role/user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 将角色从用户剥夺 将角色从用户剥夺，同时将高于此角色的角色全部剥夺 DELETE /system/role/user */
export async function removeRoleFromUser(
  body: API.SysRoleLinkVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/system/role/user', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建新的角色 创建新的角色 POST /system/role */
export async function createRole(body: API.SysRoleVo, options?: { [key: string]: any }) {
  return request<API.RBoolean>('/system/role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除角色 删除角色 DELETE /system/role */
export async function deleteRole(body: string, options?: { [key: string]: any }) {
  return request<API.RBoolean>('/system/role', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 返回可用角色列表 返回可用角色列表 GET /system/role/list */
export async function listRole(options?: { [key: string]: any }) {
  return request<API.RListSysRoleVo>('/system/role/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 批量删除角色 批量删除角色（未找到的角色通过错误抛出） DELETE /system/role/batch */
export async function deleteRoleBatch(body: string[], options?: { [key: string]: any }) {
  return request<API.RBoolean>('/system/role/batch', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
