import type { ShallowRef } from 'vue'
import type { IconMapping } from '@deck.gl/layers/typed/icon-layer/icon-manager'
import { renderMarkerSprite } from '../utils'
import { getDigest } from '@/utils'

export interface MarkerSpriteHookOptions {
  tagSprite: Readonly<ShallowRef<Blob | undefined>>
  tagsPositionList: Readonly<ShallowRef<DBType.TagSprite['tagsPositionList']>>
}

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

  const refreshSpriteImage = async () => {
    if (!tagSprite.value)
      return

    const tagSpriteDigest = await getDigest(await tagSprite.value.arrayBuffer(), 'SHA-256')

    const res = await renderMarkerSprite({
      states,
      tagSpriteDigest,
      tagsPositionList: tagsPositionList.value,
      tagSprite: await tagSprite.value.arrayBuffer(),
    })

    markerSpriteImage.value = new Blob([res.image], { type: 'image/png' })
    markerSpriteMapping.value = res.mapping
  }

  watch(tagSprite, refreshSpriteImage)

  return {
    markerSpriteImage,
    markerSpriteUrl,
    markerSpriteMapping,
    refreshSpriteImage,
  }
}
