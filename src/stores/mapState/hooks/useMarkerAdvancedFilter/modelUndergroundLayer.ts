import { computed } from 'vue'
import type {
  MAFConfig,
  MAFMetaDummy,
  MAFOptionSelect,
  MAFValueStringArray,
} from '@/stores/types'
import { useAreaStore, useMarkerExtraStore } from '@/stores'
import type { AreaWithExtraConfig } from '@/stores'

export class UndergroundLayer implements MAFConfig {
  id = 6
  name = '地下层级'
  option: ComputedRef<MAFOptionSelect<AreaWithExtraConfig>> = computed(() => {
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

  prepare(_val: MAFValueStringArray): MAFMetaDummy {
    return {}
  }

  semantic(_val: MAFValueStringArray, _opt: MAFOptionSelect<AreaWithExtraConfig>, _meta: MAFMetaDummy, _opposite: boolean): string {
    return ''
  }

  filter(_val: MAFValueStringArray, _opt: MAFOptionSelect<AreaWithExtraConfig>, _meta: MAFMetaDummy, _marker: API.MarkerVo): boolean {
    return false
  }
}
