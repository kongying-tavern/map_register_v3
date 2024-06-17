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

  prepare(_val: MAFValueStringArray, opt: OptionType): MAFMetaUndergroundLayer {
    const meta: MAFMetaUndergroundLayer = {
      layerKeyMap: {},
    }

    // 处理层级键映射
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
          const { value: itemKey = '' } = item
          meta.layerKeyMap[itemKey] = [
            ...(meta.layerKeyMap[itemKey] ?? []),
            {
              areaId,
              areaName,
              groupKey,
              groupName,
            },
          ]
        })
      })
    })

    return meta
  }

  semantic(_val: MAFValueStringArray, _opt: OptionType, _meta: MAFMetaUndergroundLayer, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueStringArray, _opt: OptionType, _meta: MAFMetaUndergroundLayer, _marker: API.MarkerVo): boolean {
    return false
  }
}
