// 以下接口为手动编写，并且不走 axios 拦截器
import type { AxiosRequestConfig } from 'axios'
import { messageFrom, request } from '@/utils'

/** 云盘 - 登录 */
export const token = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_ALIYUN_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        otp_code: '',
        username: import.meta.env.VITE_IMG_SERVER_USERNAME,
        password: import.meta.env.VITE_IMG_SERVER_PASSWORD,
      }),
    }).then(res => res.json()) as API.RDriveToken

    if (res.code !== 200)
      throw new Error(res.message || '请求失败')

    if (!res.data?.token)
      throw new Error(res.message || '登录失败')

    return res.data.token
  }
  catch (err) {
    throw err instanceof Error ? err : new Error(messageFrom(err))
  }
}

/** 云盘 - 上传图片到指定目录 */
export async function upload(body: API.AliyunDriveUploadVO, options: AxiosRequestConfig = {}) {
  const { file, path, password = '', authorization } = body

  const formData = new FormData()
  formData.append('file', file)

  const res = await request<API.RDriveUploadResult>(`${import.meta.env.VITE_ALIYUN_BASE}/api/fs/form`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
      'file-path': encodeURIComponent(path),
      password,
      authorization,
    },
    data: formData,
    ...options,
  }) ?? {}

  if (res.code !== 200)
    throw new Error(res.message ?? '请求失败')

  return res
}
