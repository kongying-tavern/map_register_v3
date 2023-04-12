import db from '@/database'
import IconRenderWorker from '@/pages/pageMapV2/worker/IconRenderWorker?worker'

export class IconManager {
  /** 物品与图标 url 对应表，持久化缓存，不需要考虑清理 */
  #iconMap = ref<Map<number, string>>(new Map())
  get iconMap() { return this.#iconMap.value }

  // DEBUG 此段代码用于调试
  // static canvas = document.createElement('canvas')
  // static ctx = this.canvas.getContext('bitmaprenderer')
  // static {
  //   this.canvas.width = 256
  //   this.canvas.height = 256
  //   this.canvas.style.position = 'fixed'
  //   this.canvas.style.zIndex = '1000'
  //   this.canvas.style.right = '0'
  //   this.canvas.style.bottom = '0'
  //   this.canvas.style.border = '1px solid red'
  //   document.body.appendChild(this.canvas)
  // }

  #renderItemIcon = (itemId: number, iconUrl?: string) => new Promise<void>((resolve, reject) => {
    try {
      if (!iconUrl)
        throw new Error('图像地址为空')

      const renderWorker = new IconRenderWorker()

      const setItemIcon = (blob: Blob) => {
        const oldUrl = this.iconMap.get(itemId)
        oldUrl && URL.revokeObjectURL(oldUrl)
        const url = URL.createObjectURL(blob)
        this.iconMap.set(itemId, url)
        resolve()
      }

      renderWorker.onmessage = async (ev: MessageEvent<ArrayBuffer | string>) => {
        if (!(ev.data instanceof ImageBitmap))
          throw new Error(`接收到的数据类型 "${Object.prototype.toString.call(ev.data)}" 与预期类型 "ImageBitmap" 不符`)

        // DEBUG 此段代码用于调试
        // IconManager.canvas.width = ev.data.width * 4
        // IconManager.canvas.height = ev.data.height * 4
        // IconManager.ctx?.transferFromImageBitmap(ev.data)

        const canvas = document.createElement('canvas')
        canvas.width = ev.data.width
        canvas.height = ev.data.height
        const ctx = canvas.getContext('bitmaprenderer')
        ctx?.transferFromImageBitmap(ev.data)
        canvas.toBlob((blob) => {
          blob ? setItemIcon(blob) : reject(new Error('无法解析图像'))
        })
      }
      renderWorker.postMessage(iconUrl)
    }
    catch (err) {
      reject(err)
    }
  })

  initIconMap = (items: API.ItemVo[]) => Promise.all(items.map(async (item) => {
    const iconTag = await db.iconTag.where('tag').equals(item.iconTag as string).first()
    await this.#renderItemIcon(item.itemId as number, iconTag?.url)
  }))
}
