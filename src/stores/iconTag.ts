import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import { useBackendUpdate, useMarkerSprite, useTagSprite, userHook } from './hooks'
import { useUserAuthStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

/** 本地图标标签数据 */
export const useIconTagStore = defineStore('global-icon-tag', () => {
  const tagList = shallowRef<API.TagVo[]>([])
  const total = ref(0)

  /** tag 名称到实体的索引表 */
  const tagNameMap = computed(() => tagList.value.reduce((seed, tag) => {
    seed.set(tag.tag!, tag)
    return seed
  }, new Map<string, API.TagVo>()))

  /** @deprecated */
  const iconTagMap = computed(() => Object.fromEntries(tagList.value.map(iconTag => [
    iconTag.tag as string,
    iconTag as API.TagVo,
  ])) as Record<string, API.TagVo>)

  const backendUpdater = useBackendUpdate(
    db.iconTag,
    async () => {
      const { data: digest = '' } = await Api.tagDoc.listAllTagBz2Md5()
      return [digest]
    },
    async (index) => {
      if (index !== 0)
        return []
      const buffer = (await Api.tagDoc.listAllTagBz2({ responseType: 'arraybuffer' })) as unknown as ArrayBuffer
      const data = await Zip.decompressAs<API.TagVo[]>(new Uint8Array(buffer))
      return data
    },
  )

  const { tagSpriteImage, tagSpriteUrl, tagPositionMap, tagsPositionList, refresh: refreshTagSprite } = useTagSprite()

  const { markerSpriteUrl, markerSpriteMapping } = useMarkerSprite({
    tagsPositionList,
    tagSprite: tagSpriteImage,
  })

  liveQuery(() => db.iconTag.toArray()).subscribe((data) => {
    total.value = data.length
    tagList.value = data
    refreshTagSprite(data)
  })

  return {
    // getters
    total: total as Readonly<Ref<number>>,
    tagNameMap,
    iconTagMap,
    tagSpriteImage,
    tagSpriteUrl,
    tagPositionMap,
    markerSpriteUrl,
    markerSpriteMapping,

    // actions
    backendUpdater,
  }
})

userHook.onInfoChange(useIconTagStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
