import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import Aliyun from '@/api/aliyun'

/** @deprecated 后续迁移至图床接口 */
export const useImageHostingStore = defineStore('image-hosting-service', () => {
  /** 用户凭证，8 小时失效 */
  const token = autoResetRef('', 8 * 60 * 60 * 1000)

  const getToken = async () => {
    if (token.value)
      return token.value
    const newToken = await Aliyun.token()
    token.value = newToken
    return newToken
  }

  /** 上传图片，返回上传后的回显地址 */
  const upload = async (file: File, onProgress?: (progress: number) => void) => {
    const authorization = await getToken()

    const current = dayjs().format('YYYY-MM-DD')

    const body = {
      authorization,
      file,
      path: `/${import.meta.env.DEV ? 'img_dev' : 'marker_img'}/${current}/${file.name}`,
    }

    await Aliyun.upload(body, {
      onUploadProgress: (ev) => {
        const { loaded = 0, total = 0 } = ev
        onProgress?.(loaded / total)
      },
    })

    return `https://tiles.yuanshen.site/d${body.path}`
  }

  return {
    // actions
    upload,
  }
})
