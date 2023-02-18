import { request } from '@/utils';

/** 此处后端没有提供注释 POST /system/user/update */
export async function updateUser(
  params: {
    // header
},
  body: API.SysUserUpdateDto,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/system/user/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /system/user/update_password */
export async function updateUserPassword(
  params: {
    // header
},
  body: API.SysUserPasswordUpdateDto,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/system/user/update_password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /system/user/register */
export async function registerUser(
  body: API.SysUserRegisterVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>('/system/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /system/user/register/qq */
export async function registerUserByQQ(
  body: API.SysUserRegisterVo,
  options?: { [key: string]: any },
) {
  return request<API.RLong>('/system/user/register/qq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户信息批量查询 用户信息批量查询 POST /system/user/info/userList */
export async function getUserList(
  body: API.SysUserSearchVo,
  options?: { [key: string]: any },
) {
  return request<API.RPageListVoSysUserVo>('/system/user/info/userList', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /system/user/info/${param0} */
export async function getUserInfo(
  params: {
    // header
// path
    userId: number;
  },
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.RSysUserVo>(`/system/user/info/${param0}`, {
    method: 'GET',
    headers: {},
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /system/user/${param0} */
export async function deleteUser(
  params: {
    // path
    workId: number;
  },
  options?: { [key: string]: any },
) {
  const { workId: param0, ...queryParams } = params;
  return request<API.RBoolean>(`/system/user/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
