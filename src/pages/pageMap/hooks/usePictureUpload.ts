import type { Ref } from 'vue'
import type { AxiosProgressEvent } from 'axios'
import dayjs from 'dayjs'
import Aliyun from '@/api/aliyun'
import { Logger, messageFrom } from '@/utils'

export interface PictureUploadHookOptions {
  rawImage: Ref<Blob | undefined>
  thumbnailImage: Ref<Blob | undefined>
}

const logger = new Logger('[usePictureUpload]')

const blobToFile = (blob: Blob, filename: string, lastModified = new Date().getTime()) => {
  return new File([blob], filename, { type: blob.type, lastModified })
}

const getRandomString = (len: number) => [...crypto.getRandomValues(new Uint8Array(Math.floor(len / 2)))]
  .map(item => item.toString(16).padStart(2, '0')).join('')

export const usePictureUpload = (options: PictureUploadHookOptions) => {
  const { rawImage, thumbnailImage } = options

  const percentage = ref<number | undefined>()
  const stepContent = ref('')
  const errMsg = ref('')

  const resetState = () => {
    percentage.value = 0
    stepContent.value = ''
    errMsg.value = ''
  }

  const onUploadProgress = ({ progress = 0 }: AxiosProgressEvent) => {
    percentage.value = Math.floor(progress * 100)
  }

  /** 上传成功后返回图片的存储地址 */
  const uploadPicture = async (filename = getRandomString(32)) => {
    resetState()
    try {
      if (!rawImage.value)
        throw new Error('原图不能为空')
      if (!thumbnailImage.value)
        throw new Error('缩略图不能为空')

      const today = dayjs()
      const date = today.format('YYYY-MM-DD')
      const lastModified = today.valueOf()

      // 登录获取 token
      stepContent.value = '获取凭证'
      const { code: c1 = 0, message: m1 = '', data: { token: authorization = '' } = {} } = await Aliyun.token()
      if (c1 !== 200)
        throw new Error(m1)

      // 上传缩略图
      const thumbnailFilename = `${filename}.jpg`
      stepContent.value = '上传缩略图'
      const { code: c2, message: m2 } = await Aliyun.upload({
        authorization,
        file: blobToFile(thumbnailImage.value, thumbnailFilename, lastModified),
        path: `${import.meta.env.VITE_ALIYUN_MARKER_FOLDER}/${date}/${thumbnailFilename}`,
      }, { onUploadProgress })
      if (c2 !== 200)
        throw new Error(m2)

      // 上传大图
      const rawFilename = `${filename}_large.jpg`
      stepContent.value = '上传大图'
      const { code: c3, message: m3 } = await Aliyun.upload({
        authorization,
        file: blobToFile(rawImage.value, rawFilename, lastModified),
        path: `${import.meta.env.VITE_ALIYUN_MARKER_FOLDER}/${date}/${rawFilename}`,
      }, { onUploadProgress })
      if (c3 !== 200)
        throw new Error(m3)

      // 返回缩略图的地址
      return `${import.meta.env.VITE_ALIYUN_IMAGE_BASE}/${import.meta.env.VITE_ALIYUN_MARKER_FOLDER}/${date}/${thumbnailFilename}`
    }
    catch (err) {
      logger.error(err)
      errMsg.value = messageFrom(err)
    }
    finally {
      stepContent.value = '完成'
    }
  }

  return { percentage, stepContent, errMsg, uploadPicture }
}
