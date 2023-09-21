import { defineStore } from 'pinia'
import { defaultsDeep, template } from 'lodash'
import { useDadianStore, useMapStore, useUserStore } from '.'

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

export interface OverlayControlGroup {
  id: string
  name: string
  bounds: API.OverlayBounds
  items: { id: string; name: string }[]
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

export interface MergedOverlayGroups {
  [areaCode: string]: OverlayGroup[]
}

const toCopy = <T>(set: Set<T>) => {
  const copySet = new Set<T>()
  set.forEach(item => copySet.add(item))
  return copySet
}

export const useOverlayStore = defineStore('map-overlays', {
  state: () => ({
    /** 每组内位于顶部的 overlay 单元 */
    topOverlayInGroup: {} as { [groupId: string]: string },
    /** 当前隐藏的 overlay 组 id */
    hiddenOverlayGroups: new Set<string>(),
    /** 当前状态 id，用于优化 deck 状态检查 */
    stateId: Date.now(),
  }),

  getters: {
    /** 合并了 neigui 权限下的配置 */
    mergedOverlayGroups: (): MergedOverlayGroups => {
      const overlayGroups: MergedOverlayGroups = {}
      const { plugins = {}, pluginsNeigui = {} } = useDadianStore()._raw

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

        if (!useUserStore().isNeigui)
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
    },

    /** 规范化的单项 overlay 配置 */
    normalizedOverlayChunks(): OverlayChunk[] {
      const result: OverlayChunk[] = []
      const urlSet = new Set<string>()
      for (const areaCode in this.mergedOverlayGroups) {
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
        } of this.mergedOverlayGroups[areaCode]) {
          const group = {
            id: groupId,
            name: groupLabel,
            mask,
            role,
            multiple,
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

              result.push({
                id: `chunk-${crypto.randomUUID()}`,
                areaCode,
                label: itemLabel,
                url,
                bounds: itemBounds,
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

              result.push({
                id: `chunk-${crypto.randomUUID()}`,
                areaCode,
                label: chunkLabel,
                url,
                bounds: chunkBounds,
                group,
                item,
              })
            }
          }
        }
      }
      return result
    },

    /** 只存在于当前图层内的 overlay */
    existOverlays(): OverlayChunk[] {
      const mapStore = useMapStore()
      return this.normalizedOverlayChunks.filter(chunk => mapStore.currentAreaCodes.has(chunk.areaCode))
    },

    /** 此处排序用于控制组内 overlay 谁在顶部 */
    sortedOverlays(): OverlayChunk[] {
      return this.existOverlays.sort((overlayA, overlayB) => {
        const itemAId = this.topOverlayInGroup[overlayA.group.id]
        const itemBId = this.topOverlayInGroup[overlayB.group.id]
        return Number(itemAId === overlayA.item.id) - Number(itemBId === overlayB.item.id)
      })
    },

    /** 此类 overlay 应当位于 overlay 遮罩层上方 */
    normalOverlays(): OverlayChunk[] {
      return this.sortedOverlays.filter(chunk => chunk.group.role === 'default')
    },

    /** 此类 overlay 应当位于 overlay 遮罩层下方 */
    tileLikeOverlays(): OverlayChunk[] {
      return this.sortedOverlays.filter(chunk => chunk.group.role === 'tile')
    },

    /** 只存在于当前图层内的 overlay 控制组 */
    overlayControlGroups(): Record<string, OverlayControlGroup> {
      const groups: Record<string, OverlayControlGroup> = {}
      const itemIdsSet = new Set<string>()
      this.existOverlays.forEach((chunk) => {
        if (!groups[chunk.group.id]) {
          groups[chunk.group.id] = {
            id: chunk.group.id,
            name: chunk.group.name,
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
    },

    showMask(): boolean {
      for (const chunk of this.existOverlays) {
        if (!chunk.group.mask)
          return false
      }
      return true
    },
  },

  actions: {
    moveToTop(itemId: string, groupId: string) {
      if (itemId === this.topOverlayInGroup[groupId])
        return
      this.$patch({
        topOverlayInGroup: {
          ...this.topOverlayInGroup,
          [groupId]: itemId,
        },
        stateId: Date.now(),
      })
    },

    initTopOverlays() {
      if (Object.keys(this.topOverlayInGroup).length > 0)
        return
      const topOverlayInGroup = this.normalizedOverlayChunks.reduce((seed, chunk) => {
        if (!seed[chunk.group.id])
          seed[chunk.group.id] = chunk.item.id
        return seed
      }, {} as Record<string, string>)
      this.$patch({
        topOverlayInGroup,
        stateId: Date.now(),
      })
    },

    showOverlayGroup(groupId: string) {
      const copySet = toCopy(this.hiddenOverlayGroups)
      copySet.delete(groupId)
      this.$patch({
        hiddenOverlayGroups: copySet,
        stateId: Date.now(),
      })
    },

    hideOverlayGroup(groupId: string) {
      const copySet = toCopy(this.hiddenOverlayGroups)
      copySet.add(groupId)
      this.$patch({
        hiddenOverlayGroups: copySet,
        stateId: Date.now(),
      })
    },
  },
})
