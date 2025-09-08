import type { ShallowRef } from 'vue'
import { renderTagSprite } from '@/worker/tagSpriteRenderer'

/** 图标纹理 - 预渲染 */
export const useIconTextureRender = () => {
  /** 图标纹理 */
  const texture = shallowRef<Blob>()

  /** 图标纹理 url */
  const textureUrl = useObjectUrl(texture)

  /** 图标到坐标的映射 */
  const positionList = shallowRef<DBType.IconSprite['positionList']>([])

  /**
   * tag 位置索引表
   * @deprecated
   */
  const positionMap = computed(() => {
    const res: Record<string, [number, number]> = {}
    positionList.value.forEach(({ ids: tags, pos }) => {
      tags.forEach((tag) => {
        res[tag] = pos
      })
    })
    return res
  })

  /** 位置索引表 */
  const coordMap = computed(() => positionList.value.reduce((map, { ids, pos }) => {
    ids.forEach(id => map.set(id, pos))
    return map
  }, new Map<number, [x: number, y: number]>()))

  /** 预渲染标签精灵图 */
  const refresh = async (list: API.IconVo[]) => {
    const renderResult = await renderTagSprite({
      iconList: list.map(icon => ({ id: icon.id!, src: icon.url! })),
    })
    texture.value = new Blob([renderResult.texture], { type: 'image/png' })
    positionList.value = renderResult.positionList
  }

  return {
    texture: texture as Readonly<ShallowRef<Blob | undefined>>,
    textureUrl: textureUrl as Readonly<Ref<string | undefined>>,
    positionMap: positionMap as Readonly<ShallowRef<Record<string, [number, number]>>>,
    coordMap,
    positionList: positionList as Readonly<ShallowRef<DBType.IconSprite['positionList']>>,
    refresh,
  }
}
