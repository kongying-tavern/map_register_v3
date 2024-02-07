// 以下接口为手动编写
import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

async function upload(body: API.IconUploadVo, options: AxiosRequestConfig = {}) {
  const formData = new FormData()
  for (const key in body)
    formData.set(key, body[key as keyof API.IconUploadVo])

  return request<API.RIconUpload>(`${import.meta.env.VITE_ASSETS_BASE}${import.meta.env.DEV ? '/Dev' : ''}/upload.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
    ...options,
  })
}

export default {
  upload,
}
