import type { ShallowRef } from 'vue'
import { renderTagSprite } from '@/worker/tagSpriteRenderer'

export const useTagSprite = () => {
  /** tag 精灵图 */
  const tagSpriteImage = shallowRef<Blob>()

  /** tag 精灵图 url */
  const tagSpriteUrl = useObjectUrl(tagSpriteImage)

  /** tag 索引数组 */
  const tagsPositionList = shallowRef<DBType.TagSprite['tagsPositionList']>([])

  /**
   * tag 位置索引表
   * @deprecated
   */
  const tagPositionMap = computed(() => {
    const res: Record<string, [number, number]> = {}
    tagsPositionList.value.forEach(({ tags, pos }) => {
      tags.forEach((tag) => {
        res[tag] = pos
      })
    })
    return res
  })

  /** tag 位置索引表 */
  const tagCoordMap = computed(() => tagsPositionList.value.reduce((map, { tags, pos }) => {
    tags.forEach(tag => map.set(tag, pos))
    return map
  }, new Map<string, [x: number, y: number]>()))

  const setTagSprite = (params: DBType.TagSprite) => {
    tagSpriteImage.value = new Blob([params.image], { type: 'image/png' })
    tagsPositionList.value = params.tagsPositionList
  }

  /** 预渲染标签精灵图 */
  const refresh = async (list: API.TagVo[]) => {
    const renderResult = await renderTagSprite({
      tagList: list.map(tag => ({ tag: tag.tag!, url: tag.url! })),
    })
    setTagSprite(renderResult)
  }

  return {
    tagSpriteImage: tagSpriteImage as Readonly<ShallowRef<Blob | undefined>>,
    tagSpriteUrl: tagSpriteUrl as Readonly<Ref<string | undefined>>,
    tagPositionMap: tagPositionMap as Readonly<ShallowRef<Record<string, [number, number]>>>,
    tagCoordMap,
    tagsPositionList: tagsPositionList as Readonly<ShallowRef<DBType.TagSprite['tagsPositionList']>>,
    setTagSprite,
    refresh,
  }
}
