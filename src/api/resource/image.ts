import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 上传图片 上传图片至图床并返回访问地址 PUT /api/res/upload/image */
export const upload = (body: API.UploadResourceVo, options?: AxiosRequestConfig) => {
  const formData = new FormData()

  for (const key in body) {
    const item = body[key as keyof API.UploadResourceVo]
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
