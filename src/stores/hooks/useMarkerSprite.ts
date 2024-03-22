import type { ShallowRef } from 'vue'
import type { IconMapping } from '@deck.gl/layers/typed/icon-layer/icon-manager'
import { renderMarkerSprite } from '../utils'
import { Logger, formatByteSize } from '@/utils'
import db from '@/database'

export interface MarkerSpriteHookOptions {
  tagSprite: Readonly<ShallowRef<Blob | undefined>>
  tagsPositionList: Readonly<ShallowRef<DBType.TagSprite['tagsPositionList']>>
}

const logger = new Logger('[点位渲染Hook]')

export const useMarkerSprite = (options: MarkerSpriteHookOptions) => {
  const { tagSprite, tagsPositionList } = options

  const markerSpriteImage = shallowRef<Blob>()

  const markerSpriteUrl = useObjectUrl(markerSpriteImage)

  /** 标签 mapping  */
  const markerSpriteMapping = shallowRef<IconMapping>({})

  const states: { state: string; color: string }[] = [
    { state: 'default', color: '#FFFFFF' },
    { state: 'hover', color: '#FFFF00' },
    { state: 'marked', color: '#00FFFD' },
  ]

  const getDigest = async (data: ArrayBuffer) => {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data))
    return [...new Uint8Array(hash)].map(num => num.toString(16).padStart(2, '0')).join('')
  }

  const refreshSpriteImage = async () => {
    if (!tagSprite.value)
      return

    const tagSpriteDigest = await getDigest(await tagSprite.value.arrayBuffer())

    const cache = await db.cache.get('markerSprite')
    if (cache && cache.id === 'markerSprite' && cache.value.tagSpriteDigest === tagSpriteDigest) {
      markerSpriteImage.value = new Blob([cache.value.image], { type: 'image/png' })
      markerSpriteMapping.value = cache.value.mapping
      return
    }

    const startTime = Date.now()
    const res = await renderMarkerSprite({
      states,
      tagsPositionList: tagsPositionList.value,
      tagSprite: await tagSprite.value.arrayBuffer(),
    })

    const digest = await getDigest(res.image)
    await db.cache.put({
      id: 'markerSprite',
      value: {
        image: res.image,
        mapping: res.mapping,
        tagSpriteDigest,
      },
      digest,
    })

    markerSpriteImage.value = new Blob([res.image], { type: 'image/png' })
    markerSpriteMapping.value = res.mapping

    logger.info(`渲染大小 ${formatByteSize(res.image.byteLength)}，总耗时 ${Date.now() - startTime} ms`)
  }

  watch(tagSprite, refreshSpriteImage)

  return {
    markerSpriteImage,
    markerSpriteUrl,
    markerSpriteMapping,
    refreshSpriteImage,
  }
}
