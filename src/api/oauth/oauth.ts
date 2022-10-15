import { request } from '@/utils'

/** 登录 - 密码模式 */
export async function token(
  body: API.SysTokenVO,
  options?: { [key: string]: any },
) {
  const form = new FormData()
  for (const key in body) {
    const value = body[key as keyof typeof body]
    form.append(key, value)
  }
  return request<API.RBoolean>('/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: form,
    auth: {
      username: 'client',
      password: 'secret',
    },
    ...(options || {}),
  })
}
