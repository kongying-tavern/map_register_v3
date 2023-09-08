import { defineStore } from 'pinia'
import { template } from 'lodash'
import { useDadianStore, useMapStore, useUserStore } from '.'

export interface OverlaySingleConfig {
  /** config 自身的唯一 id */
  id: string
  /** overlay 名称 */
  label: string
  /** overlay 所属的分组 */
  groupId: string
  /** 组名称 */
  groupLabel?: string
  /** 分组内是否支持多重显示 */
  groupMultiple: boolean
  /** chunk 所属的单元 */
  unitId: string
  /** overlay 所属的地区代码 */
  areaCode: string
  /** overlay 图片地址 */
  url: string
  /** overlay 区域 */
  bounds: API.OverlayBounds
}

export interface OverlayGroup {
  groupId: string
  label?: string
  units: {
    [unitId: string]: string
  }
  bounds: [xmin: number, ymax: number, xmax: number, ymin: number]
}

export const useOverlayStore = defineStore('map-overlays', {
  state: () => ({
    /** 每组内位于顶部的 overlay 单元 */
    topOverlayInGroup: {} as { [groupId: string]: string },
    /** 当前隐藏的 overlay 组 id */
    hiddenOverlayGroups: new Set<string>(),
    /** 当前状态 id，用于优化 deck 状态检查 */
    stateId: Date.now(),
    /** 影响 overlay 渲染的默认配置 */
    _defaultOverlayConfig: {
      overlayMask: false,
      overlayMaskOpacity: 0.5,
    },
  }),

  getters: {
    mergedPluginConfig: (): Record<string, API.PluginConfig> => {
      const dadianStore = useDadianStore()
      const { plugins = {}, pluginsNeigui = {} } = dadianStore._raw
      const userStore = useUserStore()
      return userStore.isNeigui ? { ...plugins, ...pluginsNeigui } : plugins
    },

    mergedOverlayConfig() {
      const overlayConfig = {
        overlayMask: false,
        overlayMaskOpacity: 0.5,
      }
      const mapStore = useMapStore()
      if (!mapStore.currentLayer)
        return overlayConfig
      const { areaCodes = [] } = mapStore.currentLayer
      const areaCodeSet = new Set(areaCodes)
      for (const areaCode in this.mergedPluginConfig) {
        if (!areaCodeSet.has(areaCode))
          continue
        const { overlayConfig: { overlayMask = false, overlayMaskOpacity = 0.5 } = {} } = this.mergedPluginConfig[areaCode]
        Object.assign(overlayConfig, { overlayMask, overlayMaskOpacity })
      }
      return overlayConfig
    },

    /** 规范化 overlay 配置 */
    normalizedOverlayConfigs(): OverlaySingleConfig[] {
      return Object.entries(this.mergedPluginConfig).reduce((seed, [areaCode, { overlay = false, overlayConfig = {} }]) => {
        if (!overlay)
          return seed

        const { overlays = [], urlTemplate = '', multiple = false } = overlayConfig

        const urlSet = new Set<string>()

        overlays.forEach(({
          url: groupUrl,
          urlTemplate: groupUrlTemplate = urlTemplate,
          label: groupLabel,
          value: groupValue,
          bounds: groupBounds,
          children = [],
        }) => {
          const groupId = crypto.randomUUID()
          children.forEach(({
            url: itemUrl = groupUrl,
            urlTemplate: itemUrlTemplate = groupUrlTemplate,
            label: itemLabel = groupLabel,
            value: itemValue = groupValue,
            bounds: itemBounds = groupBounds,
            chunks = [],
          }) => {
            const unitId = crypto.randomUUID()
            const complied = template(itemUrlTemplate, { interpolate: /{{([\s\S]+?)}}/g })
            if (!chunks.length) {
              if (!itemLabel || !itemBounds)
                return
              const url = itemUrl || complied({ groupLabel, groupValue, itemLabel, itemValue })
              seed.push({
                id: crypto.randomUUID(),
                label: itemLabel,
                groupId,
                groupLabel,
                groupMultiple: multiple,
                unitId,
                areaCode,
                url,
                bounds: itemBounds,
              })
              return
            }

            chunks.forEach(({
              url: chunkUrl = itemUrl,
              label: chunkLabel = itemLabel,
              value: chunkValue = itemValue,
              bounds: chunkBounds = itemBounds,
            }) => {
              if (!chunkLabel || !chunkBounds || (!chunkUrl && !itemUrlTemplate))
                return
              const url = chunkUrl || complied({ groupLabel, groupValue, itemLabel, itemValue, chunkLabel, chunkValue })
              if (urlSet.has(url))
                return
              urlSet.add(url)
              seed.push({
                id: crypto.randomUUID(),
                label: chunkLabel,
                groupId,
                groupLabel,
                groupMultiple: multiple,
                unitId,
                areaCode,
                url,
                bounds: chunkBounds,
              })
            })
          })
        })

        return seed
      }, [] as OverlaySingleConfig[])
    },

    /** 只存在于当前图层内的 overlay */
    visibleOverlays(): OverlaySingleConfig[] {
      const mapStore = useMapStore()
      if (!mapStore.currentLayer)
        return []

      const areaCodeSet = new Set(mapStore.currentLayer.areaCodes ?? [])
      return (this.normalizedOverlayConfigs as unknown as OverlaySingleConfig[])
        .filter(overlay => areaCodeSet.has(overlay.areaCode))
        // 此处排序用于控制组内 overlay 谁在顶部
        .sort((overlayA, overlayB) => {
          return Number(this.topOverlayInGroup[overlayA.groupId] === overlayA.unitId) - Number(this.topOverlayInGroup[overlayB.groupId] === overlayB.unitId)
        })
    },

    overlayUnitGroups(): { [groupId: string]: OverlayGroup } {
      const groups = {} as { [groupId: string]: OverlayGroup }
      this.visibleOverlays.forEach((overlay) => {
        const [[xmin, ymin], [xmax, ymax]] = overlay.bounds
        if (!groups[overlay.groupId]) {
          groups[overlay.groupId] = {
            groupId: overlay.groupId,
            label: overlay.groupLabel,
            units: { [overlay.unitId]: overlay.label },
            bounds: [xmin, ymax, xmax, ymin],
          }
          return
        }
        groups[overlay.groupId].units[overlay.unitId] = overlay.label
        const [sxmin, symax, sxmax, symin] = groups[overlay.groupId].bounds
        groups[overlay.groupId].bounds = [
          xmin < sxmin ? xmin : sxmin,
          ymax > symax ? ymax : symax,
          xmax > sxmax ? xmax : sxmax,
          ymin < symin ? ymin : symin,
        ]
      })
      return groups
    },
  },

  actions: {
    moveToTop(unitId: string, groupId: string) {
      if (unitId === this.topOverlayInGroup[groupId])
        return
      this.topOverlayInGroup[groupId] = unitId
      this.stateId = Date.now()
    },

    initTopOverlays(reset = false) {
      if (reset)
        this.topOverlayInGroup = {}
      if (Object.keys(this.topOverlayInGroup).length > 0)
        return
      for (const groupId in this.overlayUnitGroups) {
        const { units } = this.overlayUnitGroups[groupId]
        this.topOverlayInGroup[groupId] = Object.keys(units)[0]
      }
    },

    showOverlayGroup(groupId: string) {
      this.hiddenOverlayGroups.delete(groupId)
      this.stateId = Date.now()
    },

    hideOverlayGroup(groupId: string) {
      this.hiddenOverlayGroups.add(groupId)
      this.stateId = Date.now()
    },
  },
})
