import { defineStore } from 'pinia'
import { defaultsDeep, template } from 'lodash'
import { useDadianStore, usePreferenceStore, useTileStore, useUserInfoStore } from '.'

export interface OverlayGroup {
  id: string
  label?: API.OverlayGroupOption['label']
  value?: API.OverlayGroupOption['value']
  multiple: API.OverlayConfig['multiple']
  mask: API.OverlayConfig['overlayMask']
  url?: API.OverlayGroupOption['url']
  urlTemplate?: API.OverlayGroupOption['urlTemplate']
  bounds?: API.OverlayBounds
  items: API.OverlayOption[]
  role: API.OverlayRole
}

export interface OverlayUnit {
  id: string
  label?: string
  value?: string
  url?: API.OverlayOption['url']
  urlTemplate?: API.OverlayOption['urlTemplate']
  bounds?: API.OverlayBounds
}

export interface OverlayChunk {
  /** config 自身的唯一 id */
  id: string
  /** overlay 名称 */
  label: string
  /** overlay 所属的分组 */
  group: {
    id: string
    name: string
    mask: boolean
    role: API.OverlayRole
    multiple: boolean
    areaCode: string
  }
  /** chunk 所属的单元 */
  item: {
    id: string
    name: string
  }
  /** overlay 所属的地区代码 */
  areaCode: string
  /** overlay 图片地址 */
  url: string
  /** overlay 区域 */
  bounds: API.OverlayBounds
}

type OverlayChunkGroup = OverlayChunk['group']
export interface OverlayControlGroup extends OverlayChunkGroup {
  bounds: API.OverlayBounds
  items: { id: string; name: string }[]
}

export interface MergedOverlayGroups {
  [areaCode: string]: OverlayGroup[]
}

const toCopy = <T>(set: Set<T>) => {
  const copySet = new Set<T>()
  set.forEach(item => copySet.add(item))
  return copySet
}

/** 地图附加图层 */
export const useOverlayStore = defineStore('global-map-overlays', () => {
  const dadianStore = useDadianStore()
  const tileStore = useTileStore()
  const preferenceStore = usePreferenceStore()

  /** 每组内位于顶部的 overlay 单元 */
  const topOverlayInGroup = shallowRef<{ [groupId: string]: string }>({})

  /** 当前隐藏的 overlay 组 id */
  const hiddenOverlayGroups = ref(new Set<string>())

  /** 当前状态 id，用于优化 deck 状态检查 */
  const stateId = ref(Date.now())

  /** 合并了 neigui 权限下的配置 */
  const mergedOverlayGroups = computed((): MergedOverlayGroups => {
    const overlayGroups: MergedOverlayGroups = {}
    const { plugins = {}, pluginsNeigui = {} } = dadianStore._raw

    for (const areaCode in plugins) {
      overlayGroups[areaCode] = []

      const { overlay = false, overlayConfig = {} } = plugins[areaCode]
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

      if (!useUserInfoStore().isNeigui)
        continue

      defaultsDeep(pluginsNeigui, plugins)
      const { overlay: overlayNeigui, overlayConfig: neiguiConfig = {} } = pluginsNeigui[areaCode] ?? {}
      overlayNeigui && neiguiConfig.overlays?.forEach(({ urlTemplate = overlayConfig.urlTemplate, children: items = [], role = 'default', ...rest }) => {
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
    const result: OverlayChunk[] = []
    const urlSet = new Set<string>()
    for (const areaCode in mergedOverlayGroups.value) {
      for (const {
        id: groupId,
        label: groupLabel = 'unknown',
        value: groupValue,
        items,
        url: groupUrl,
        urlTemplate: groupUrlTemplate,
        bounds: groupBounds,
        mask = false,
        role,
        multiple = false,
      } of mergedOverlayGroups.value[areaCode]) {
        const group = {
          id: groupId,
          name: groupLabel,
          mask,
          role,
          multiple,
          areaCode,
        }

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
          const complied = template(itemUrlTemplate, { interpolate: /{{([\s\S]+?)}}/g })

          if (!chunks.length) {
            if (!itemBounds)
              continue
            const url = itemUrl ?? complied({ groupLabel, groupValue, itemLabel, itemValue })
            if (urlSet.has(url))
              continue
            urlSet.add(url)

            const { center: [cx, cy] } = mergedTileConfigs[areaCode].tile
            const [[xmin, ymin], [xmax, ymax]] = itemBounds

            result.push({
              id: `chunk-${crypto.randomUUID()}`,
              areaCode,
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
            if (urlSet.has(url))
              continue
            urlSet.add(url)

            const { center: [cx, cy] } = mergedTileConfigs[areaCode].tile
            const [[xmin, ymin], [xmax, ymax]] = chunkBounds

            result.push({
              id: `chunk-${crypto.randomUUID()}`,
              areaCode,
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
    return result
  })

  /** 只存在于当前图层内的 overlay */
  const existOverlays = computed((): OverlayChunk[] => {
    const { currentTileConfig } = tileStore
    if (!currentTileConfig)
      return []
    const { mergedTileConfigs } = tileStore
    const { code: currentLayerCode } = currentTileConfig.tile
    return normalizedOverlayChunks.value.filter(({ areaCode }) => {
      return mergedTileConfigs[areaCode].tile.code === currentLayerCode
    })
  })

  /** 此处排序用于控制组内 overlay 谁在顶部 */
  const sortedOverlays = computed((): OverlayChunk[] => {
    const topMap = topOverlayInGroup.value
    const exists = existOverlays.value
    return exists.toSorted((overlayA, overlayB) => {
      const itemAId = topMap[overlayA.group.id]
      const itemBId = topMap[overlayB.group.id]
      return Number(itemAId === overlayA.item.id) - Number(itemBId === overlayB.item.id)
    })
  })

  /** 此类 overlay 应当位于 overlay 遮罩层上方 */
  const normalOverlays = computed((): OverlayChunk[] => {
    return sortedOverlays.value.filter(chunk => chunk.group.role === 'default')
  })

  /** 此类 overlay 应当位于 overlay 遮罩层下方 */
  const tileLikeOverlays = computed((): OverlayChunk[] => {
    return sortedOverlays.value.filter(chunk => chunk.group.role === 'tile')
  })

  /** 只存在于当前图层内的 overlay 控制组 */
  const overlayControlGroups = computed((): Record<string, OverlayControlGroup> => {
    const groups: Record<string, OverlayControlGroup> = {}
    const itemIdsSet = new Set<string>()
    existOverlays.value.forEach((chunk) => {
      if (!groups[chunk.group.id]) {
        groups[chunk.group.id] = {
          ...chunk.group,
          bounds: chunk.bounds,
          items: [],
        }
      }
      const group = groups[chunk.group.id]
      const [[xmin, ymin], [xmax, ymax]] = group.bounds
      const [[cxmin, cymin], [cxmax, cymax]] = chunk.bounds
      group.bounds = [
        [Math.min(xmin, cxmin), Math.min(ymin, cymin)],
        [Math.max(xmax, cxmax), Math.max(ymax, cymax)],
      ]
      if (itemIdsSet.has(chunk.item.id))
        return
      itemIdsSet.add(chunk.item.id)
      group.items.push(chunk.item)
    })
    return groups
  })

  const isOverlaysHasMask = computed(() => {
    for (const chunk of existOverlays.value) {
      if (chunk.group.mask)
        return true
    }
    return false
  })

  const showMask = computed((): boolean => {
    if (!preferenceStore.preference['map.state.showOverlay'])
      return false
    return isOverlaysHasMask.value
  })

  const moveToTop = (itemId: string, groupId: string) => {
    const topMap = { ...topOverlayInGroup.value }
    if (itemId === topMap[groupId])
      return
    topMap[groupId] = itemId
    topOverlayInGroup.value = topMap
    stateId.value = Date.now()
  }

  const initTopOverlays = (isReset = false) => {
    if (isReset)
      topOverlayInGroup.value = {}
    if (Object.keys(topOverlayInGroup.value).length > 0)
      return
    const defaultTopOverlayInGroup = normalizedOverlayChunks.value.reduce((seed, chunk) => {
      if (!seed[chunk.group.id])
        seed[chunk.group.id] = chunk.item.id
      return seed
    }, {} as Record<string, string>)
    topOverlayInGroup.value = defaultTopOverlayInGroup
    stateId.value = Date.now()
  }

  watch(normalizedOverlayChunks, () => initTopOverlays(false), { immediate: true })

  const showOverlayGroup = (groupId: string) => {
    const copySet = toCopy(hiddenOverlayGroups.value)
    copySet.delete(groupId)
    hiddenOverlayGroups.value = copySet
    stateId.value = Date.now()
  }

  const hideOverlayGroup = (groupId: string) => {
    const copySet = toCopy(hiddenOverlayGroups.value)
    copySet.add(groupId)
    hiddenOverlayGroups.value = copySet
    stateId.value = Date.now()
  }

  return {
    // state
    topOverlayInGroup,
    stateId,
    hiddenOverlayGroups,

    // getters
    mergedOverlayGroups,
    normalizedOverlayChunks,
    normalOverlays,
    tileLikeOverlays,
    overlayControlGroups,
    showMask,

    // action
    moveToTop,
    initTopOverlays,
    showOverlayGroup,
    hideOverlayGroup,
  }
})
