import type { AreaWithExtraConfig } from '@/stores'
import type {
  MAFConfig,
  MAFMetaUndergroundLayer,
  MAFOptionSelect,
  MAFSemanticUnit,
  MAFValueStringArray,
} from '@/stores/types'
import { useAreaStore, useMarkerExtraStore } from '@/stores'

type OptionType = MAFOptionSelect<AreaWithExtraConfig>

interface ExtraUnderground {
  region_levels?: string[]
}

export class UndergroundLayer implements MAFConfig<MAFValueStringArray, OptionType, MAFMetaUndergroundLayer> {
  id = 202
  name = '分层层级'
  option: ComputedRef<OptionType> = computed(() => {
    const { areaCodeMap } = useAreaStore()
    const { mergedAreaExtraConfigs } = useMarkerExtraStore()

    const undergroundOptions: AreaWithExtraConfig[] = []
    for (const areaCode in mergedAreaExtraConfigs) {
      if (!areaCodeMap.has(areaCode))
        continue
      const area = areaCodeMap.get(areaCode) as AreaWithExtraConfig

      const { underground = {} } = mergedAreaExtraConfigs[areaCode]
      const { levels = [] } = underground
      if (levels.length <= 0)
        continue
      undergroundOptions.push({
        ...area,
        extraConfig: { underground },
      })
    }

    return {
      dialogTitle: '选择分层层级',
      options: undergroundOptions,
      optionSelectMultiple: true,
      optionLabel: 'label',
      optionValue: 'value',
    }
  })

  get defaultVal(): MAFValueStringArray {
    return {
      sa: [],
    }
  }

  prepare(val: MAFValueStringArray, opt: OptionType): MAFMetaUndergroundLayer {
    const meta: MAFMetaUndergroundLayer = {
      layerKeyMap: {},
      layerNameMap: {},
      tagList: [],
      tag: '',
    }

    // 处理层级键映射
    // 处理层级名称映射
    opt.options.forEach((area) => {
      const {
        id: areaId = 0,
        name: areaName = '',
        extraConfig = {},
      } = area
      const { underground = {} } = extraConfig
      const { levels = [] } = underground
      levels.forEach((group) => {
        const {
          value: groupKey = '',
          label: groupName = '',
        } = group
        group.children.forEach((item) => {
          const {
            value: itemKey = '',
            label: itemName = '',
          } = item
          // 层级键映射
          meta.layerKeyMap[itemKey] = [
            ...(meta.layerKeyMap[itemKey] ?? []),
            {
              areaId,
              areaName,
              groupKey,
              groupName,
            },
          ]
          // 层级名称映射
          meta.layerNameMap[itemKey] = itemName
        })
      })
    })

    // 处理标签名
    meta.tagList = val.sa
      .map(v => meta.layerNameMap[v])
      .filter(v => v)
    meta.tag = meta.tagList.join(',')

    return meta
  }

  semantic(_val: MAFValueStringArray, _opt: OptionType, meta: MAFMetaUndergroundLayer, opposite: boolean): MAFSemanticUnit[] {
    return [
      { type: 'text', text: '分层层级' },
      opposite ? { type: 'opposite-indicator', text: '不' } : null,
      { type: 'text', text: '属于' },
      ...meta.tagList.map(tag => ({ type: 'tag', text: tag })),
    ].filter(v => v) as MAFSemanticUnit[]
  }

  filter(val: MAFValueStringArray, _opt: OptionType, _meta: MAFMetaUndergroundLayer, marker: API.MarkerVo): boolean {
    const extra = (marker.extra?.underground ?? {}) as ExtraUnderground
    const regionLevels = extra.region_levels ?? []
    for (const regionLevel of regionLevels) {
      if (val.sa.includes(regionLevel))
        return true
    }
    return false
  }
}
