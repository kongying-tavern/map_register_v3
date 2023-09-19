import type { PickingInfo } from '@deck.gl/core/typed'
import type { GenshinMap } from '.'
import { handleHoverChange } from '.'

export const getTooltip = (target: GenshinMap, info: PickingInfo) => {
  handleHoverChange(target, info)

  if (!target.store.setting.showTooltip || !info.coordinate)
    return null

  const renderText = info.object
    ? `markerTitle: ${info.object?.markerTitle}
      markerId: ${info.object?.id}
      hiddenFlag: ${info.object?.hiddenFlag}
      picture: ${info.object?.picture}
      version: ${info.object?.version}
      position: [${info.object?.position}]
      itemIdList: [${info.object?.itemIdList?.join(',')}]
      extra: ${JSON.stringify(info.object?.extra)}`
    : info.sourceLayer
      ? `id: ${info.sourceLayer.id}`
      : '前面的区域，以后再来探索吧！'

  return renderText
}
