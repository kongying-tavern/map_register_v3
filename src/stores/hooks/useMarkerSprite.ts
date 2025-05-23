import type { IconLayerProps } from 'deck.gl'
import type { ShallowRef } from 'vue'
import { renderMarkerSprite } from '@/worker/markerSpriteRenderer'

export interface MarkerSpriteHookOptions {
  tagSprite: Readonly<ShallowRef<Blob | undefined>>
  tagsPositionList: Readonly<ShallowRef<DBType.TagSprite['tagsPositionList']>>
}

export const useMarkerSprite = (options: MarkerSpriteHookOptions) => {
  const { tagSprite, tagsPositionList } = options

  const markerSpriteImage = shallowRef<Blob>()

  const markerSpriteUrl = useObjectUrl(markerSpriteImage)

  /** 标签 mapping  */
  const markerSpriteMapping = shallowRef<Exclude<NonNullable<IconLayerProps['iconMapping']>, string>>({})

  const states: { state: string, color: string }[] = [
    { state: 'default', color: '#FFFFFF' },
    { state: 'hover', color: '#DDDDDD' },
    { state: 'focus', color: '#FFFF00' },
    { state: 'marked', color: '#00FFFD' },
  ]

  const refreshSpriteImage = async () => {
    if (!tagSprite.value)
      return

    const res = await renderMarkerSprite({
      states,
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
