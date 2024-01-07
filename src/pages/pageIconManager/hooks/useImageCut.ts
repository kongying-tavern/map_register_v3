import type { UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useFetchHook } from '@/hooks'
import type { ElUploadType } from '@/shared'
import Aliyun from '@/api/aliyun'
import { messageFrom } from '@/utils'

export const useImageCut = () => {
  const uploaderRef = ref<ElUploadType | null>(null)
  const uploadImage = shallowRef<Blob>()

  const cutImageFile = shallowRef<Blob>()
  const cutImageUrl = useObjectUrl(cutImageFile)
  const setCutImage = (img?: Blob) => {
    cutImageFile.value = img
  }

  const handleImageChange = (uploadFile: UploadFile) => {
    try {
      const { raw: file } = uploadFile
      uploaderRef.value?.handleRemove(uploadFile)
      if (!file || !/image\/\S+/.test(file.type))
        throw new Error('目标为文件夹或无法识别的类型')
      uploadImage.value = file
    }
    catch (err) {
      ElMessage.error({
        message: `选择图片失败，原因为：${messageFrom(err)}`,
        offset: 48,
      })
    }
  }

  /** 上传进度百分比 */
  const uploadProgress = ref(0)
  const setUploadProgress = (progress: number) => {
    uploadProgress.value = progress * 100
  }

  /** 上传后的图片地址 */
  const uploadImageUrl = ref('')

  const { refresh: uploadIcon, onSuccess: onUploadSuccess, onError: onUploadError } = useFetchHook({
    onRequest: async (file: File) => {
      setUploadProgress(0)

      const today = dayjs()
      const dateOfToday = today.format('YYYY-MM-DD')
      const path = `${import.meta.env.VITE_ALIYUN_ICON_FOLDER}/${dateOfToday}/${file.name}`

      const { data: { token: authorization = '' } = {} } = await Aliyun.token()
      await Aliyun.upload({ authorization, path, file }, {
        onUploadProgress: ({ progress = 0 }) => setUploadProgress(progress),
      })

      return `${import.meta.env.VITE_ALIYUN_IMAGE_BASE}${path}`
    },
  })

  onUploadSuccess((resPath) => {
    if (!resPath) {
      return ElMessage.error({
        message: '服务器未返回上传结果，无法生成路径信息',
        offset: 48,
      })
    }
    uploadImageUrl.value = resPath
  })

  onUploadError((err) => {
    ElMessage.error({
      message: `上传图片失败，原因为：${err.message}`,
      offset: 48,
    })
    setUploadProgress(Number.NaN)
  })

  return { uploaderRef, uploadImage, uploadImageUrl, uploadProgress, cutImageFile, cutImageUrl, setCutImage, handleImageChange, uploadIcon, onUploadSuccess }
}
