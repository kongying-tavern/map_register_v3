import type { Ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig } from 'axios'
import Aliyun from '@/api/aliyun'
import { Logger } from '@/utils'
import { useFetchHook } from '@/hooks'

export interface PictureUploadHookOptions {
  rawImage: Ref<Blob | undefined>
  thumbnailImage: Ref<Blob | undefined>
}

const logger = new Logger('[usePictureUpload]')
const IMAGE_SERVER_URL = 'https://tiles.yuanshen.site/d'

export const usePictureUpload = (options: PictureUploadHookOptions) => {
  const { rawImage, thumbnailImage } = options

  const blobToFile = (blob: Blob, filename: string, lastModified = new Date().getTime()) => {
    return new File([blob], filename, { type: blob.type, lastModified })
  }

  const getRandomString = (len: number) => [...crypto.getRandomValues(new Uint8Array(Math.floor(len / 2)))]
    .map(item => item.toString(16).padStart(2, '0')).join('')

  const { refresh: uploadMarkerPicture, onSuccess: onUploadSuccess, onError: onUploadError } = useFetchHook({
    onRequest: async () => {
      if (!rawImage.value)
        throw new Error('原图不能为空')
      if (!thumbnailImage.value)
        throw new Error('缩略图不能为空')

      const randomFileName = getRandomString(32)
      const today = new Date().getTime()

      // 创建当日文件夹
      const path = `/marker_image/${dayjs().format('YYYY-MM-DD')}`
      await Aliyun.mkdir({ path })

      // 上传缩略图
      const thumbnailFilename = `${randomFileName}.jpg`
      const thumbnailFile = blobToFile(thumbnailImage.value, thumbnailFilename, today)
      await Aliyun.upload({ files: thumbnailFile, path }, {
        onUploadProgress: (() => {}) as AxiosRequestConfig['onUploadProgress'],
      })

      // 上传大图
      const rawFilename = `${randomFileName}_large.jpg`
      const rawFile = blobToFile(rawImage.value, rawFilename, today)
      await Aliyun.upload({ files: rawFile, path })

      // 上传图片后的地址
      const thumbnailImgUrl = `${IMAGE_SERVER_URL}${path}/${thumbnailFilename}`
      const rawImgUrl = `${IMAGE_SERVER_URL}${path}/${rawFilename}`

      return { rawImgUrl, thumbnailImgUrl }
    },
  })

  onUploadError((err) => {
    ElMessage.error(err.message)
    logger.error(err)
  })

  return { uploadMarkerPicture, onUploadSuccess, onUploadError }
}
