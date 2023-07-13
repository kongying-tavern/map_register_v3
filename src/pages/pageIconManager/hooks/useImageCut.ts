import type { UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useFetchHook } from '@/hooks'
import type { ElUploadType } from '@/shared'
import Icon from '@/api/icon'
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
        message: messageFrom(err),
        offset: 48,
      })
    }
  }

  /** 上传进度百分比 */
  const uploadProgress = ref(0)
  const changeUploadProgress = (progress: number) => {
    console.log('[set progress]', progress * 100)
    uploadProgress.value = progress * 100
  }

  /** 上传后的图片地址 */
  const uploadImageUrl = ref('')

  const { refresh: uploadIcon, onSuccess: onUploadSuccess, onError: onUploadError } = useFetchHook({
    onRequest: async (file: File) => {
      changeUploadProgress(0)
      const res = await Icon.upload({ file_name: file.name, file_data: file }, {
        onUploadProgress: ({ progress = 0 }) => changeUploadProgress(progress),
      })
      if (res.err_info)
        throw new Error(res.err_info)
      return res
    },
  })

  onUploadSuccess((res) => {
    if (!res.path) {
      return ElMessage.error({
        message: '服务器未返回上传结果，无法生成路径信息',
        offset: 48,
      })
    }
    uploadImageUrl.value = `${import.meta.env.VITE_ASSETS_BASE}${import.meta.env.DEV ? '/Dev' : ''}${res.path.replace(/^\./, '')}`
  })

  onUploadError(err => ElMessage.error({
    message: err.message,
    offset: 48,
  }))

  return { uploaderRef, uploadImage, uploadImageUrl, uploadProgress, cutImageFile, cutImageUrl, setCutImage, handleImageChange, uploadIcon, onUploadSuccess }
}
