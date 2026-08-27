import type { MarkerVo } from '@/api/alova/globals'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores'
import { getDigest } from '@/utils'

/** 图片上传 hook */
export const usePictureUpload = () => {
  const userStore = useUserStore()

  const uploadImage = async (body: { file?: File, filePath?: string }) => {
    const formData = new FormData()

    const { file, filePath } = body
    if (!file || !filePath)
      throw new Error('上传文件或路径为空')

    formData.append('file', file)
    formData.append('filePath', filePath)

    const res = await Apis.resource.uploadImage({
      data: {
        file,
        filePath,
      },
    })

    return res
  }

  /**
   * 检测 picture 是否为数据地址，是则处理图片上传逻辑
   * @note 该函数可能会修改对象属性值
   */
  const tryUploadPicture = async (form: MarkerVo) => {
    if (!form.picture?.toLowerCase().startsWith('blob:'))
      return

    const url = new URL(form.picture)

    const lastModified = Date.now()

    const folder = `${dayjs().format('YYYY-MM-DD')}`

    // 提取缩略图
    const thumbUrl = `${url.protocol}${url.pathname}`
    const thumbImage = await (await fetch(thumbUrl)).blob()
    const thumbImageName = `${await getDigest(thumbImage, 'SHA-256')}.png`

    const file = new File([thumbImage], thumbImageName, { type: 'image/png', lastModified })
    const filePath = `${folder}/${thumbImageName}`

    // 如果资源已经存在，直接复用已存在的链接
    const { data: existing } = await Apis.resource.getResource({ params: { filePath } })
    const existingUrl = existing?.fileUrl
    if (!existingUrl) {
      const { data: { fileUrl } = {} } = await uploadImage({ file, filePath })
      if (!fileUrl)
        throw new Error(`上传 ${filePath} 失败`)

      form.picture = fileUrl
    }
    else {
      form.picture = existingUrl
    }

    form.pictureCreatorId = userStore.info?.id
  }

  return { tryUploadPicture }
}
