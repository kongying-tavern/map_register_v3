import type { IconMapping } from '@deck.gl/layers/typed/icon-layer/icon-manager'
import { ElNotification } from 'element-plus'
import db from '@/database'
import IconRenderWorker from '@/pages/pageMapV2/worker/IconRenderWorker?worker'
import { BORDER_WIDTH, ICON_RECT } from '@/pages/pageMapV2/config/markerIcon'

/**
 * 地上图标 默认状态
 * [`${itemId}`_default]: {}
 *
 * 地上图标 hover 状态
 * [`${itemId}`_hover]: {}
 *
 * 地上图标 active 状态
 * [`${itemId}`_active]: {}
 *
 * 地上图标 focus 状态
 * [`${itemId}`_focus]: {}
 *
 * 地下图标 默认状态
 * [`${itemId}`_ug_default]: {}
 *
 * 地下图标 hover 状态
 * [`${itemId}`_ug_hover]: {}
 *
 * 地下图标 active 状态
 * [`${itemId}`_ug_active]: {}
 *
 * 地下图标 focus 状态
 * [`${itemId}`_ug_focus]: {}
 */
export interface SpiritIconMap extends IconMapping {
}

export class IconManager {
  /** 预渲染的精灵图 */
  get spiritImage() { return this.#spiritImage.value }
  #spiritImage = ref('')

  /** 物品图标在精灵图上的匹配参数 */
  get iconMapping() { return this.#iconMapping.value }
  #iconMapping = shallowRef<SpiritIconMap>({})

  renderWorker = new IconRenderWorker()

  /**
   * 渲染思路：
   * 1. 对物品列表检索到所有匹配的 iconTag 并对其 url 进行统一的 icon 请求
   * 2. 遍历所有的 icon，生成一张总体精灵图
   * 3. 生成与精灵图对应的 iconMapping，格式见 `SpiritIconMap`
   */
  initIconMap = async (items: API.ItemVo[]) => {
    if (!items.length) {
      const oldUrl = this.spiritImage
      URL.revokeObjectURL(oldUrl)
      this.#spiritImage.value = ''
      return
    }

    const itemIconTags = items.map(item => item.iconTag as string)
    const iconTagMap = new Map<string, { url: string; index: number }>()

    if ((await db.iconTag.count()) === 0)
      ElNotification.warning('本地图标数据库为空，点位可能无法正常渲染，请更新本地图标数据库')

    let index = 0
    await db.iconTag.where('tag').anyOf(itemIconTags).each((iconTag) => {
      iconTagMap.set(iconTag.tag as string, { url: iconTag.url as string, index: index++ })
    })

    // 生成 iconMapping
    const iconMapping = items.reduce((seed, item) => {
      const iconIndex = iconTagMap.get(item.iconTag as string)?.index
      if (iconIndex === undefined)
        return seed
      const baseProps = {
        width: ICON_RECT[0],
        height: ICON_RECT[1],
        anchorY: ICON_RECT[1] - BORDER_WIDTH,
        y: iconIndex * ICON_RECT[1],
      }
      ;[
        '_default',
        '_hover',
        '_active',
        '_focus',
        '_ug_default',
        '_ug_hover',
        '_ug_active',
        '_ug_focus',
      ].forEach((append, index) => {
        seed[`${item.id}${append}`] = { ...baseProps, x: baseProps.width * index }
      })
      return seed
    }, {} as SpiritIconMap)
    this.#iconMapping.value = iconMapping

    // 离屏渲染
    const blob = await this.#renderSpiritImage(iconTagMap)
    const url = URL.createObjectURL(blob)
    const oldUrl = this.spiritImage
    this.#spiritImage.value = url
    URL.revokeObjectURL(oldUrl)
  }

  /** 在离屏 canvas 中完成具体精灵图的绘制 */
  #renderSpiritImage = (iconTagMap: Map<string, { url: string; index: number }>) => new Promise<Blob>((resolve, reject) => {
    this.renderWorker.onmessage = async (ev: MessageEvent<ImageBitmap | string>) => {
      if (!(ev.data instanceof ImageBitmap))
        return reject(new Error(ev.data))
      const canvas = document.createElement('canvas')
      canvas.width = ev.data.width
      canvas.height = ev.data.height
      const ctx = canvas.getContext('bitmaprenderer')
      ctx?.transferFromImageBitmap(ev.data)
      canvas.toBlob((blob) => {
        if (!blob)
          return reject(new Error('无法生成精灵图'))
        resolve(blob)
      })
    }
    this.renderWorker.postMessage(iconTagMap)
  })
}
