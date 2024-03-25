import type { AxiosRequestConfig } from 'axios'
import dayjs from 'dayjs'
import { getDigest, request } from '@/utils'
import { useUserInfoStore } from '@/stores'

/** 图片上传 hook */
export const usePictureUpload = () => {
  const userInfoStore = useUserInfoStore()

  /**
   * @note 不要使用 Api.resource.uploadImage，该接口生成存在 bug
   */
  const uploadImage = (body: { file?: File; filePath?: string }, options?: AxiosRequestConfig) => {
    const formData = new FormData()

    for (const key in body) {
      const item = body[key]
      if (item === undefined)
        continue
      formData.append(key, item)
    }

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

    // 提取大图
    const largeUrl = `${url.searchParams.get('raw')}`
    const largeImage = await (await fetch(largeUrl)).blob()
    const largeImageName = `${await getDigest(largeImage, 'SHA-256')}.png`

    // 上传缩略图
    const { data: { fileUrl } = {} } = await uploadImage({
      file: new File([thumbImage], thumbImageName, { type: 'image/png', lastModified }),
      filePath: `${folder}/${thumbImageName}`,
    })

    // 上传大图
    await uploadImage({
      file: new File([largeImage], largeImageName, { type: 'image/png', lastModified }),
      filePath: `${folder}/${largeImageName}`,
    })

    form.picture = fileUrl
    form.pictureCreatorId = userInfoStore.info.id
  }

  return { tryUploadPicture }
}
