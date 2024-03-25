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
const pickMainItem = ({ itemList = [] }: API.MarkerVo, itemIdMap: Map<number, API.ItemVo>) => {
  const restItemIds: number[] = []
  const restIconTags: string[] = []

  let index = -1
  let mainItem: API.ItemVo | undefined

  itemList.forEach(({ itemId = -1 }) => {
    const item = itemIdMap.get(itemId)
    if (!item)
      return

    if (!mainItem) {
      mainItem = item
      index = item.sortIndex ?? -1
      return
    }

    // 将 sortIndex 更大的作为主渲染图标
    const { sortIndex = -1 } = item
    if (sortIndex <= index)
      return

    mainItem = item
    index = sortIndex
  })

  return {
    mainItemId: mainItem!.id!,
    restItemIds,
    mainIconTag: mainItem!.iconTag!,
    restIconTags,
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
        ...pickMainItem(marker, itemIdMap),
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
