import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 上传图片 上传图片至图床并返回访问地址 PUT /api/res/upload/image */
export async function uploadImage(
  body: {
    file?: File
    uploadVo?: API.ResourceUploadVo
  },
  options?: AxiosRequestConfig,
) {
  const formData = new FormData()

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele] // eslint-disable-line ts/no-explicit-any

    if (item !== undefined && item !== null) {
      if (typeof item === 'object') {
        for (const k of item) {
          const v = item[k]
          formData.append(k, v)
        }
      }
      else {
        formData.append(ele, item)
      }
    }
  })

  return request<API.RResourceUploadVo>('/api/res/upload/image', {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
    ...(options || {}),
  })
}
