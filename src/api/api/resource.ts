import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 上传图片 上传图片至图床并返回访问地址 PUT /api/res/upload/image */
export async function uploadImage(
  body: {
    file?: string
    uploadVo?: API.ResourceUploadVo
  },
  options?: AxiosRequestConfig,
) {
  return request<API.RResourceUploadVo>('/api/res/upload/image', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
