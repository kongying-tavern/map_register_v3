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
      if (item instanceof File) {
        formData.append(ele, item)
      }
      else {
        for (const k in item) {
          formData.append(k, item[k])
        }
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
