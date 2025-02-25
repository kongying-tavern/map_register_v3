import type {
  MergedOverlayGroups,
  OverlayChunk,
  OverlayChunkGroup,
} from '@/packages/map'
import { merge, template } from 'lodash'
import { defineStore } from 'pinia'
import { useAccessStore, useArchiveStore, useDadianStore, useTileStore } from '.'

/** 地图附加图层 */
export const useOverlayStore = defineStore('global-map-overlays', () => {
  const tileStore = useTileStore()
  const accessStore = useAccessStore()
  const archiveStore = useArchiveStore()
  const dadianStore = useDadianStore()

  /** 当前激活的 overlay 单元（激活状态并不代表显示状态） */
  const activedItemIds = ref(new Set<string>())

  const showOverlay = computed(() => {
    return archiveStore.currentArchive.body.Preference['map.state.showOverlay']
  })

  const mergedPlugins = computed(() => {
    const { plugins = {}, pluginsNeigui = {} } = dadianStore.raw
    return accessStore.hasNeigui
      ? merge(plugins, pluginsNeigui)
      : plugins
  })

  /** 合并了 neigui 权限下的配置 */
  const mergedOverlayGroups = computed((): MergedOverlayGroups => {
    const overlayGroups: MergedOverlayGroups = {}
    for (const areaCode in mergedPlugins.value) {
      overlayGroups[areaCode] = []
      const { overlay = false, overlayConfig = {} } = mergedPlugins.value[areaCode]
      overlay && overlayConfig.overlays?.forEach(({ urlTemplate = overlayConfig.urlTemplate, children: items = [], role = 'default', ...rest }) => {
        overlayGroups[areaCode].push({
          multiple: overlayConfig.multiple ?? false,
          mask: overlayConfig.overlayMask ?? false,
          urlTemplate,
          id: `group-${crypto.randomUUID()}`,
          items,
          role,
          ...rest,
        })
      })
    }
    return overlayGroups
  })

  /** 规范化的单项 overlay 配置 */
  const normalizedOverlayChunks = computed((): OverlayChunk[] => {
    const { mergedTileConfigs } = tileStore
    if (!mergedTileConfigs)
      return []
    // TODO Map 无法保证 KV 顺序，建议改为有序 Map
    const resultMap = new Map<string, OverlayChunk>()
    const groupCache = new Map<string, OverlayChunkGroup>()
    for (const areaCode in mergedOverlayGroups.value) {
      for (let groupIndex = 0; groupIndex < mergedOverlayGroups.value[areaCode].length; groupIndex++) {
        const {
          id: groupId,
          label: groupLabel = 'unknown',
          value: groupValue = '',
          items,
          url: groupUrl,
          urlTemplate: groupUrlTemplate,
          bounds: groupBounds,
          mask = false,
          role,
          multiple = false,
        } = mergedOverlayGroups.value[areaCode][groupIndex]

        const tileConfigInArea = mergedTileConfigs[areaCode]
        if (!tileConfigInArea)
          continue

        if (groupCache.has(groupValue)) {
          groupCache.get(groupValue)?.areaCodes.add(areaCode)
          groupCache.get(groupValue)?.areaIndexes.set(areaCode, groupIndex)
        }
        else {
          groupCache.set(groupValue, {
            id: groupId,
            name: groupLabel,
            mask,
            role,
            multiple,
            areaCodes: new Set<string>([areaCode]),
            areaIndexes: new Map<string, number>([[areaCode, groupIndex]]),
          })
        }
        const group = groupCache.get(groupValue)!

        for (const {
          label: itemLabel = groupLabel,
          value: itemValue = groupValue,
          url: itemUrl = groupUrl,
          urlTemplate: itemUrlTemplate = groupUrlTemplate,
          bounds: itemBounds = groupBounds,
          chunks = [],
        } of items) {
          const item = {
            id: `item-${crypto.randomUUID()}`,
            name: itemLabel,
          }
          const complied = template(itemUrlTemplate, { interpolate: /\{\{([\s\S]+?)\}\}/g })

          if (!chunks.length) {
            if (!itemBounds)
              continue
            const url = itemUrl ?? complied({ groupLabel, groupValue, itemLabel, itemValue })
            if (resultMap.has(url)) {
              resultMap.get(url)!.areaCodes.add(areaCode)
              continue
            }

            const { center: [cx, cy] } = tileConfigInArea.tile
            const [[xmin, ymin], [xmax, ymax]] = itemBounds

            resultMap.set(url, {
              id: `chunk-${crypto.randomUUID()}`,
              areaCodes: new Set<string>([areaCode]),
              label: itemLabel,
              url,
              bounds: [[xmin + cx, ymin + cy], [xmax + cx, ymax + cy]],
              group,
              item,
            })
            continue
          }

          for (const {
            label: chunkLabel = itemLabel,
            value: chunkValue = itemValue,
            url: chunkUrl = itemUrl ?? complied({ groupLabel, groupValue, itemLabel, itemValue, chunkLabel, chunkValue }),
            bounds: chunkBounds = itemBounds,
          } of chunks) {
            if (!chunkBounds)
              continue

            const url = chunkUrl || complied({ groupLabel, groupValue, itemLabel, itemValue, chunkLabel, chunkValue })
            if (resultMap.has(url)) {
              resultMap.get(url)!.areaCodes.add(areaCode)
              continue
            }

            const { center: [cx, cy] } = tileConfigInArea.tile
            const [[xmin, ymin], [xmax, ymax]] = chunkBounds

            resultMap.set(url, {
              id: `chunk-${crypto.randomUUID()}`,
              areaCodes: new Set<string>([areaCode]),
              label: chunkLabel,
              url,
              bounds: [[xmin + cx, ymin + cy], [xmax + cx, ymax + cy]],
              group,
              item,
            })
          }
        }
      }
    }
    return Array.from(resultMap.values())
  })

  // 初始化地图类型附加图层
  watch(normalizedOverlayChunks, (chunks) => {
    const selectedItemInGroup = new Map<string, string>()
    chunks.forEach((chunk) => {
      const { role, id: groupId } = chunk.group
      const { id: itemId } = chunk.item
      // 底图图层在每组内只能为单选
      if (role !== 'tile' || selectedItemInGroup.has(groupId))
        return
      selectedItemInGroup.set(groupId, itemId)
    })
    const itemIdSet = new Set<string>()
    selectedItemInGroup.forEach((itemId) => {
      itemIdSet.add(itemId)
    })
    activedItemIds.value = itemIdSet
  }, { immediate: true })

  const items = computed(() => {
    const itemGroups = Map.groupBy(normalizedOverlayChunks.value, chunk => chunk.item)
    return [...itemGroups.entries()].map(([item, chunks]) => {
      return {
        ...item,
        areaCodes: chunks[0].areaCodes,
        chunks,
      }
    })
  })

  /** chunk 索引表 */
  const chunkMap = computed(() => normalizedOverlayChunks.value.reduce((map, chunk) => {
    map.set(chunk.id, chunk)
    return map
  }, new Map<string, OverlayChunk>()))

  /** 当前激活的 overlay 单元（激活状态并不代表显示状态） */
  const activedItems = computed(() => items.value.filter(item => activedItemIds.value.has(item.id)))

  /** 只存在于当前图层内的 overlay */
  const existOverlays = computed((): OverlayChunk[] => {
    const { currentTileConfig } = tileStore
    if (!currentTileConfig)
      return []
    const { mergedTileConfigs } = tileStore
    const { code: currentLayerCode } = currentTileConfig.tile
    const hideDefaultOverlay = !showOverlay.value
    return normalizedOverlayChunks.value.filter(({ areaCodes, group }) => {
      if (hideDefaultOverlay && group.role === 'default')
        return false

      for (const areaCode of areaCodes) {
        const config = mergedTileConfigs[areaCode]
        if (!config)
          continue
        if (config.tile.code === currentLayerCode)
          return true
      }
      return false
    })
  })

  /** 只存在于当前图层内且可见的 chunks */
  const visibleChunks = computed(() => {
    return existOverlays.value.reduce((seed, chunk) => {
      if (!activedItemIds.value.has(chunk.item.id))
        return seed
      seed[chunk.group.role].push(chunk.id)
      return seed
    }, {
      default: [] as string[],
      tile: [] as string[],
    })
  })

  const isOverlaysHasMask = computed(() => {
    for (const chunk of existOverlays.value) {
      if (chunk.group.mask)
        return true
    }
    return false
  })

  const showMask = computed((): boolean => {
    if (!isOverlaysHasMask.value)
      return false
    return Boolean(existOverlays.value.find((chunk) => {
      const { role } = chunk.group
      if (role === 'tile')
        return false
      return activedItemIds.value.has(chunk.item.id)
    }))
  })

  return {
    // state
    activedItemIds,

    // getters
    items,
    chunkMap,
    existOverlays,
    showMask,
    activedItems,
    visibleChunks,
  }
})
