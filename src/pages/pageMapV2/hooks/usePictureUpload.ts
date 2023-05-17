import type { Ref } from 'vue'
import type { AxiosProgressEvent } from 'axios'
import dayjs from 'dayjs'
import Aliyun from '@/api/aliyun'
import { Logger, messageFrom } from '@/utils'

export interface PictureUploadHookOptions {
  rawImage: Ref<Blob | undefined>
  thumbnailImage: Ref<Blob | undefined>
  onPictureChanged?: () => void
}

const logger = new Logger('[usePictureUpload]')

const blobToFile = (blob: Blob, filename: string, lastModified = new Date().getTime()) => {
  return new File([blob], filename, { type: blob.type, lastModified })
}

const getRandomString = (len: number) => [...crypto.getRandomValues(new Uint8Array(Math.floor(len / 2)))]
  .map(item => item.toString(16).padStart(2, '0')).join('')

export const usePictureUpload = (options: PictureUploadHookOptions) => {
  const { rawImage, thumbnailImage, onPictureChanged } = options

  const percentage = ref<number | undefined>()
  const stepContent = ref('')
  const errMsg = ref('')
  /** 用于避免重复上传缩略图的 flag */
  const isThumbUploaded = ref(false)
  /** 用于避免重复上传大图的 flag */
  const isRawUploaded = ref(false)
  const uploadToken = ref('')

  const resetState = () => {
    percentage.value = 0
    stepContent.value = ''
    errMsg.value = ''
  }

  const onUploadProgress = ({ progress = 0 }: AxiosProgressEvent) => {
    percentage.value = Math.floor(progress * 100)
  }

  watch(() => thumbnailImage.value, () => {
    isThumbUploaded.value = false
  })

  watch(() => rawImage.value, () => {
    isRawUploaded.value = false
  })

  const getToken = async () => {
    stepContent.value = '获取凭证'
    const { code: c1 = 0, message: m1 = '', data: { token: authorization = '' } = {} } = await Aliyun.token()
    if (c1 !== 200)
      throw new Error(m1)
    uploadToken.value = authorization
  }

  /** 上传成功后返回图片的存储地址 */
  const uploadPicture = async (filename = getRandomString(32)) => {
    try {
      if (!rawImage.value)
        throw new Error('原图不能为空')
      if (!thumbnailImage.value)
        throw new Error('缩略图不能为空')

      const today = dayjs()
      const date = today.format('YYYY-MM-DD')
      const lastModified = today.valueOf()
      const thumbnailFilename = `${filename}.jpg`
      const rawFilename = `${filename}_large.jpg`

      if (!isThumbUploaded.value || !isRawUploaded.value) {
        resetState()
        await getToken()
      }

      // 上传缩略图
      if (!isThumbUploaded.value) {
        stepContent.value = '上传缩略图'
        const { code: c2, message: m2 } = await Aliyun.upload({
          authorization: uploadToken.value,
          file: blobToFile(thumbnailImage.value, thumbnailFilename, lastModified),
          path: `${import.meta.env.VITE_ALIYUN_MARKER_FOLDER}/${date}/${thumbnailFilename}`,
        }, { onUploadProgress })
        if (c2 !== 200)
          throw new Error(m2)
        isThumbUploaded.value = true
      }

      // 上传大图
      if (!isRawUploaded.value) {
        stepContent.value = '上传大图'
        const { code: c3, message: m3 } = await Aliyun.upload({
          authorization: uploadToken.value,
          file: blobToFile(rawImage.value, rawFilename, lastModified),
          path: `${import.meta.env.VITE_ALIYUN_MARKER_FOLDER}/${date}/${rawFilename}`,
        }, { onUploadProgress })
        if (c3 !== 200)
          throw new Error(m3)
        isRawUploaded.value = true
      }

      onPictureChanged?.()

      // 添加 url 附加参数，后处理方法判断 picture 是否已经变更
      const urlParams = new URLSearchParams()
      urlParams.set('timestamp', `${lastModified}`)
      const stringUrlParams = urlParams.toString()

      stepContent.value = '完成'

      // 返回缩略图的地址
      const urlPrefix = `${import.meta.env.VITE_ALIYUN_IMAGE_BASE}/${import.meta.env.VITE_ALIYUN_MARKER_FOLDER}`
      return `${urlPrefix}/${date}/${thumbnailFilename}?${stringUrlParams}`
    }
    catch (err) {
      logger.error(err)
      errMsg.value = messageFrom(err)
      stepContent.value = '错误'
    }
  }

  return { percentage, stepContent, errMsg, uploadPicture }
}