import type { ShallowRef } from 'vue'
import type { IconMapping } from '@deck.gl/layers/typed/icon-layer/icon-manager'
import { renderMarkerSprite } from '../utils'
import { Logger, formatByteSize } from '@/utils'

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

  const refreshSpriteImage = async () => {
    if (!tagSprite.value)
      return
    const startTime = Date.now()
    const res = await renderMarkerSprite({
      states,
      tagsPositionList: tagsPositionList.value,
      tagSprite: await tagSprite.value.arrayBuffer(),
    })
    markerSpriteImage.value = new Blob([res.image], { type: 'image/png' })
    markerSpriteMapping.value = res.mapping
    logger.info(`渲染大小 ${formatByteSize(res.image.byteLength)}，总耗时 ${Date.now() - startTime} ms`)
  }

  watch(tagsPositionList, refreshSpriteImage)

  return {
    markerSpriteImage,
    markerSpriteUrl,
    markerSpriteMapping,
    refreshSpriteImage,
  }
}
