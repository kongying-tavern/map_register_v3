import { computed } from 'vue'
import type {
  MAFConfig,
  MAFMetaUndergroundLayer,
  MAFOptionSelect,
  MAFValueStringArray,
} from '@/stores/types'
import { useAreaStore, useMarkerExtraStore } from '@/stores'
import type { AreaWithExtraConfig } from '@/stores'

type OptionType = MAFOptionSelect<AreaWithExtraConfig>

interface ExtraUnderground {
  region_levels?: string[]
}

export class UndergroundLayer implements MAFConfig {
  id = 6
  name = '地下层级'
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
      dialogTitle: '选择地下层级',
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
    meta.tag = val.sa
      .map(v => meta.layerNameMap[v])
      .filter(v => v)
      .join(',')

    return meta
  }

  semantic(val: MAFValueStringArray, _opt: OptionType, meta: MAFMetaUndergroundLayer, opposite: boolean): string {
    if (!val.sa || val.sa.length <= 0)
      return opposite ? '不限地下层级' : '无地下层级'
    return `可见范围${opposite ? '不' : ''}为【${meta.tag ?? ''}】`
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
