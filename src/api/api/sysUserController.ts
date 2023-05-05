import { request } from '@/utils';

/** 用户信息更新 普通用户可以更新自己的信息，系统管理员可以更新所有用户的 POST /system/user/update */
export async function updateUser(
  params: {
    // header
},
  body: API.SysUserUpdateVo,
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

/** 用户密码更新 普通用户接口，可以更新自己的密码，需提供旧密码 POST /system/user/update_password */
export async function updateUserPassword(
  params: {
    // header
},
  body: API.SysUserPasswordUpdateVo,
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

/** 用户密码修改（管理员接口） 管理员接口，直接修改任意用户密码，无需旧密码 POST /system/user/update_password_by_admin */
export async function updateUserPasswordByAdmin(
  body: API.SysUserPasswordUpdateVo,
  options?: { [key: string]: any },
) {
  return request<API.RBoolean>('/system/user/update_password_by_admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户注册(管理员权限) 用户注册(管理员权限)，可以注册任意用户名密码的用户 POST /system/user/register */
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

/** qq用户注册 qq用户注册，会对qq的有效性进行验证，并且会关联qq机器人进行验证码验证 POST /system/user/register/qq */
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

/** 用户信息获取 普通用户可以获取到自己的信息，系统管理员可以查看所有用户的 GET /system/user/info/${param0} */
export async function getUserInfo(
  params: {
    // path
    userId: number;
  },
  options?: { [key: string]: any },
) {
  const { userId: param0, ...queryParams } = params;
  return request<API.RSysUserVo>(`/system/user/info/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除用户 删除用户 DELETE /system/user/${param0} */
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
