import type { ShallowRef } from 'vue'
import { renderTagSprite } from '../utils'
import db from '@/database'

export const useTagSprite = () => {
  /** tag 精灵图 */
  const tagSpriteImage = shallowRef<Blob>()

  /** tag 精灵图 url */
  const tagSpriteUrl = useObjectUrl(tagSpriteImage)

  /** tag 索引数组 */
  const tagsPositionList = shallowRef<DBType.TagSprite['tagsPositionList']>([])

  /** tag 位置索引表 */
  const tagPositionMap = computed(() => {
    const res: Record<string, [number, number]> = {}
    tagsPositionList.value.forEach(({ tags, pos }) => {
      tags.forEach((tag) => {
        res[tag] = pos
      })
    })
    return res
  })

  const setTagSprite = (params: DBType.TagSprite) => {
    tagSpriteImage.value = new Blob([params.image], { type: 'image/png' })
    tagsPositionList.value = params.tagsPositionList
  }

  /** 预渲染标签精灵图 */
  const refresh = async (list: API.TagVo[]) => {
    const collection = db.cache.where('id').equals('tagSprite')

    const cache = await collection.first()
    if (cache && cache.id === 'tagSprite') {
      setTagSprite(cache.value)
      return
    }

    const renderResult = await renderTagSprite({
      tagList: list.map(tag => ({ tag: tag.tag!, url: tag.url! })),
    })
    setTagSprite(renderResult)
    await collection.delete()
    await db.cache.put({ id: 'tagSprite', value: renderResult })
  }

  return {
    tagSpriteImage: tagSpriteImage as Readonly<ShallowRef<Blob | undefined>>,
    tagSpriteUrl: tagSpriteUrl as Readonly<Ref<string | undefined>>,
    tagPositionMap: tagPositionMap as Readonly<ShallowRef<Record<string, [number, number]>>>,
    tagsPositionList: tagsPositionList as Readonly<ShallowRef<DBType.TagSprite['tagsPositionList']>>,
    setTagSprite,
    refresh,
  }
}
