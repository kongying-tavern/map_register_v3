// 以下接口为手动编写
import { request } from '@/utils'

// 开发环境暂时没有阿里云盘，这里先写死
const DRIVE_URL = 'https://tiles.yuanshen.site'

/** 云盘 - 新建文件夹`('/分类/日期')` */
export async function mkdir(
  body: API.AliyunDriveDirVO,
  options: Record<string, any> = {},
) {
  return request<API.RBase>(`${DRIVE_URL}/api/admin/mkdir`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...options,
  })
}

/** 云盘 - 上传图片到指定目录 */
export async function upload(
  body: API.AliyunDriveUploadVO,
  options: Record<string, any> = {},
) {
  const formData = new FormData()
  for (const key in body) {
    const value = body[key as keyof API.AliyunDriveUploadVO]
    value && formData.append(key, value)
  }
  return request<API.RBase>(`${DRIVE_URL}/api/public/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
    ...options,
  })
}
