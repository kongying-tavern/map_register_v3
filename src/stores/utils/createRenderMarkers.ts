import type { GSMapState } from '../types/genshin-map-state'
import type { AreaTileConfig } from '@/stores'
import type { MarkerExtra } from '@/utils'

export interface NormalizeMarkerOptions {
  tileConfigs: Record<string, AreaTileConfig>
  itemIdMap: Map<number, API.ItemVo>
  areaIdMap: Map<number, API.AreaVo>
  isTemporary?: boolean
}

// TODO 抽离为设置，根据设置的图标选择策略来选择主渲染图标 id
const pickMainItem = ({ itemList = [] }: API.MarkerVo) => {
  itemList.sort((a, b) => a.iconTag! === '无'
    ? 1
    : b.iconTag! === '无'
      ? -1
      : a.iconTag!.endsWith('宝箱')
        ? b.iconTag!.endsWith('宝箱')
          ? 0
          : -1
        : b.iconTag!.endsWith('宝箱')
          ? 1
          : a.count! - b.count!,
  )
  const [mainItem, ...restItems] = itemList
  return {
    mainItemId: mainItem.itemId!,
    restItemIds: restItems.map(item => item.itemId!),
    mainIconTag: mainItem.iconTag!,
    restIconTags: restItems.map(item => item.iconTag!),
  }
}

/** 为点位列表附加渲染配置 */
export const createRenderMarkers = (markers: (API.MarkerVo | GSMapState.MarkerWithRenderConfig)[], options: NormalizeMarkerOptions) => {
  const {
    tileConfigs = {},
    areaIdMap,
    itemIdMap,
    isTemporary = false,
  } = options

  /** 缓存从物品 id 查询到的地区信息和底图配置，减少索引时间复杂度 */
  const cacheMap = new Map<number, { area: API.AreaVo; tileConfig: AreaTileConfig }>()

  const normalizedMarkers: GSMapState.MarkerWithRenderConfig[] = []

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i]

    if ('render' in marker) {
      normalizedMarkers.push(marker)
      continue
    }

    // TODO 从第一个物品查询地区，后续点位可能存在属于多个地区的情况，需要加以改进
    const [firstItemLink] = marker.itemList ?? []
    if (!firstItemLink)
      continue

    const config = cacheMap.get(firstItemLink.itemId!) ?? (() => {
      const item = itemIdMap.get(firstItemLink.itemId!)
      if (!item)
        return
      const area = areaIdMap.get(item.areaId!)
      if (!area)
        return
      const tileConfig = tileConfigs[area.code!]
      if (!tileConfig)
        return
      const config = { area, tileConfig }
      cacheMap.set(item.id!, config)
      return config
    })()

    if (!config)
      continue

    const { area, tileConfig } = config
    const [ox, oy] = tileConfig.tile.center
    const [strX, strY] = marker.position!.split(',')
    normalizedMarkers.push({
      ...marker,
      render: {
        ...pickMainItem(marker),
        area,
        tileCode: tileConfig.tile.code,
        position: [Number(strX) + ox, Number(strY) + oy],
        isUnderground: (marker.extra as MarkerExtra)?.underground?.is_underground ?? false,
        isTemporary,
      },
    })
  }

  return normalizedMarkers
}
