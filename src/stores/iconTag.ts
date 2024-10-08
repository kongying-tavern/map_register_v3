import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import type { ShallowRef } from 'vue'
import { useBackendUpdate, useMarkerSprite, useTagSprite, userHook } from './hooks'
import { useSocketStore, useUserAuthStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

/** 本地图标标签数据 */
export const useIconTagStore = defineStore('global-icon-tag', () => {
  const socketStore = useSocketStore()

  const tagList = shallowRef<API.TagVo[]>([])
  const total = computed(() => tagList.value.length)

  /** tag 名称到实体的索引表 */
  const tagNameMap = computed(() => tagList.value.reduce((seed, tag) => {
    seed.set(tag.tag!, tag)
    return seed
  }, new Map<string, API.TagVo>()))

  /** @deprecated 使用 `tagNameMap` 代替 */
  const iconTagMap = computed(() => Object.fromEntries(tagList.value.map(iconTag => [
    iconTag.tag as string,
    iconTag as API.TagVo,
  ])) as Record<string, API.TagVo>)

  const backendUpdater = useBackendUpdate(
    db.iconTag,
    async () => {
      const { data: digest = '' } = await Api.tagDoc.listAllTagBinaryMd5()
      return [digest]
    },
    async (md5) => {
      const buffer = (await Api.tagDoc.listAllTagBinary({ responseType: 'arraybuffer' })) as unknown as ArrayBuffer
      const data = await Zip.decompressAs<API.TagVo[]>(new Uint8Array(buffer), {
        name: `iconTag-${md5}`,
      })
      return data
    },
  )

  const {
    tagSpriteImage,
    tagSpriteUrl,
    tagPositionMap,
    tagsPositionList,
    refresh: refreshTagSprite,
    ...rest
  } = useTagSprite()

  const {
    markerSpriteUrl,
    markerSpriteMapping,
  } = useMarkerSprite({
    tagsPositionList,
    tagSprite: tagSpriteImage,
  })

  liveQuery(() => db.iconTag.toArray()).subscribe((data) => {
    tagList.value = data
    refreshTagSprite(data)
  })

  socketStore.event.on('IconTagBinaryPurged', () => backendUpdater.refresh())

  return {
    // getters
    tagList: tagList as Readonly<ShallowRef<API.TagVo[]>>,
    total,
    tagNameMap,
    iconTagMap,
    tagSpriteImage,
    tagSpriteUrl,
    tagPositionMap,
    markerSpriteUrl,
    markerSpriteMapping,
    ...rest,

    // actions
    backendUpdater,
  }
})

userHook.onInfoChange(useIconTagStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
