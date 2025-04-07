import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 登录 - 密码模式 */
export async function token(
  body: API.SysTokenVO,
  options: AxiosRequestConfig = {},
) {
  const form = new FormData()
  for (const key in body) {
    const value = body[key as keyof typeof body]
    form.append(key, value)
  }
  return request<API.SysToken>('/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: form,
    auth: {
      username: import.meta.env.VITE_API_AUTH_USERNAME,
      password: import.meta.env.VITE_API_AUTH_PASSWORD,
    },
    ...options,
  })
}

export async function refresh(
  header: API.SysRefreshVO,
  options: AxiosRequestConfig = {},
) {
  const params = new URLSearchParams()
  for (const key in header)
    params.append(key, header[key as keyof API.SysRefreshVO])
  return request<API.SysToken>(`/oauth/token?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    auth: {
      username: import.meta.env.VITE_API_AUTH_USERNAME,
      password: import.meta.env.VITE_API_AUTH_PASSWORD,
    },
    ...options,
  })
}
