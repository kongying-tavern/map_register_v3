import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

export const upload = (body: { file: File; filePath: string }, options?: AxiosRequestConfig) => {
  const formData = new FormData()

  for (const key in body) {
    const item = body[key]
    if (item === undefined)
      continue
    formData.append(key, item)
  }

  return request<API.RResourceUploadVo>('/api/res/upload/image', {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
    ...options,
  })
}
