import type { AxiosRequestConfig } from 'axios'
import dayjs from 'dayjs'
import { getDigest, request } from '@/utils'
import { useUserStore } from '@/stores'

/** 图片上传 hook */
export const usePictureUpload = () => {
  const userStore = useUserStore()

  /**
   * @note 不要使用 Api.resource.uploadImage，该接口生成存在 bug
   */
  const uploadImage = (body: { file?: File; filePath?: string }, options?: AxiosRequestConfig) => {
    const formData = new FormData()

    const { file, filePath } = body
    if (!file || !filePath)
      throw new Error('上传文件或路径为空')

    formData.append('file', file)
    formData.append('filePath', filePath)

    return request<API.RResourceUploadVo>('/api/res/upload/image', {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
      ...options,
    })
  }

  /**
   * 检测 picture 是否为数据地址，是则处理图片上传逻辑
   * @note 该函数可能会修改对象属性值
   */
  const tryUploadPicture = async (form: API.MarkerVo) => {
    if (!form.picture?.toLowerCase().startsWith('blob:'))
      return

    const url = new URL(form.picture)

    const lastModified = Date.now()

    const folder = `${dayjs().format('YYYY-MM-DD')}`

    // 提取缩略图
    const thumbUrl = `${url.protocol}${url.pathname}`
    const thumbImage = await (await fetch(thumbUrl)).blob()
    const thumbImageName = `${await getDigest(thumbImage, 'SHA-256')}.png`

    // 上传缩略图
    const { data: { fileUrl } = {} } = await uploadImage({
      file: new File([thumbImage], thumbImageName, { type: 'image/png', lastModified }),
      filePath: `${folder}/${thumbImageName}`,
    })

    form.picture = fileUrl
    form.pictureCreatorId = userStore.info?.id
  }

  return { tryUploadPicture }
}
