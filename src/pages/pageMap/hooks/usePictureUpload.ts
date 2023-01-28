import type { Ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import Aliyun from '@/api/aliyun'
import { Logger, messageFrom } from '@/utils'

export interface PictureUploadHookOptions {
  rawImage: Ref<Blob | undefined>
  thumbnailImage: Ref<Blob | undefined>
}

const IMAGE_SERVER_URL = import.meta.env.VITE_ALIYUN_IMAGE_BASE
const MARKER_IMAGE_FOLDER = import.meta.env.VITE_ALIYUN_MARKER_FOLDER

const logger = new Logger('[usePictureUpload]')

const blobToFile = (blob: Blob, filename: string, lastModified = new Date().getTime()) => {
  return new File([blob], filename, { type: blob.type, lastModified })
}

const getRandomString = (len: number) => [...crypto.getRandomValues(new Uint8Array(Math.floor(len / 2)))]
  .map(item => item.toString(16).padStart(2, '0')).join('')

export const usePictureUpload = (options: PictureUploadHookOptions) => {
  const { rawImage, thumbnailImage } = options

  const progress = ref(0)
  const stepContent = ref('')
  const errMsg = ref('')
  const thumbnailImgUrl = ref('')
  const rawImgUrl = ref('')

  const resetState = () => {
    progress.value = 0
    stepContent.value = ''
    errMsg.value = ''
    thumbnailImgUrl.value = ''
    rawImgUrl.value = ''
  }

  const onUploadProgress = (ev: ProgressEvent) => {
    if (!ev.lengthComputable)
      return
    progress.value = ev.loaded / ev.total
  }

  const upload = async () => {
    resetState()
    try {
      if (!rawImage.value)
        throw new Error('原图不能为空')
      if (!thumbnailImage.value)
        throw new Error('缩略图不能为空')

      const randomFileName = getRandomString(32)
      const today = new Date().getTime()

      // 创建当日文件夹
      stepContent.value = '初始化上传目录'
      const path = `${MARKER_IMAGE_FOLDER}/${dayjs().format('YYYY-MM-DD')}`
      await Aliyun.mkdir({ path })

      // 上传缩略图
      const thumbnailFilename = `${randomFileName}.jpg`
      const thumbnailFile = blobToFile(thumbnailImage.value, thumbnailFilename, today)
      stepContent.value = '正在上传缩略图'
      await Aliyun.upload({ files: thumbnailFile, path }, { onUploadProgress })

      // 上传大图
      const rawFilename = `${randomFileName}_large.jpg`
      const rawFile = blobToFile(rawImage.value, rawFilename, today)
      stepContent.value = '正在上传大图'
      await Aliyun.upload({ files: rawFile, path }, { onUploadProgress })

      // 上传图片后的地址
      thumbnailImgUrl.value = `${IMAGE_SERVER_URL}${path}/${thumbnailFilename}`
      rawImgUrl.value = `${IMAGE_SERVER_URL}${path}/${rawFilename}`
    }
    catch (err) {
      logger.error(err)
      errMsg.value = messageFrom(err)
      ElMessage.error(messageFrom(err))
    }
    finally {
      stepContent.value = '完成'
    }
  }

  return { progress, stepContent, errMsg, thumbnailImgUrl, rawImgUrl, upload }
}
