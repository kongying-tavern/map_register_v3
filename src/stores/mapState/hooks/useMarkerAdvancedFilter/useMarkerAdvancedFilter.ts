import { cloneDeep, keyBy } from 'lodash'
import {
  Area,
  ContentContain,
  ContentRegex,
  IdRange,
  Image,
  ItemCount,
  ItemName,
  ItemNameRegex,
  ItemSize,
  ItemType,
  Linkage,
  RefreshTime,
  TitleContain,
  Underground,
  UndergroundLayer,
  Video,
  Visibility,
} from './models'
import type { usePreferenceStore } from '@/stores'
import type {
  MAFConfig,
  MAFGroup,
  MAFGroupComposed,
  MAFItem,
  MAFItemComposed,
} from '@/stores/types'

interface MarkerAdvancedFilterHookOptions {
  preferenceStore: ReturnType<typeof usePreferenceStore>
}

// ==================== 模型配置 ====================
const configList: MAFConfig[] = [
  new IdRange(),
  new TitleContain(),
  new ContentContain(),
  new ContentRegex(),
  new Underground(),
  new UndergroundLayer(),
  new Image(),
  new Video(),
  new Linkage(),
  new RefreshTime(),
  new Visibility(),
  new Area(),
  new ItemType(),
  new ItemName(),
  new ItemNameRegex(),
  new ItemSize(),
  new ItemCount(),
]

const configMap: Record<number, MAFConfig> = keyBy(configList, 'id')

const emptyGroup: MAFGroup = {
  operator: true,
  opposite: false,
  children: [],
}

const emptyItem: MAFItem = {
  id: 0,
  operator: true,
  opposite: false,
  value: {},
}

export const useMarkerAdvancedFilter = (options: MarkerAdvancedFilterHookOptions) => {
  const { preferenceStore } = options

  const getMAFConfig = (id: number): MAFConfig => configMap[id] ?? {
    id: 0,
    name: '',
    option: {},
    defaultVal: {},
    semantic: () => '',
    filter: () => true,
  }

  const getCount = (filter: MAFGroup[] = []) => {
    return filter.reduce((sum, group) => {
      return sum + group.children.length
    }, 0)
  }

  const conditions = computed(() => preferenceStore.preference['markerFilter.filter.advancedFilterCache'])

  const conditionSemanticText = computed<string>(() => {
    const filters = preferenceStore.preference['markerFilter.filter.advancedFilterCache'] ?? []
    const globalSem: string[] = []
    for (let groupIndex = 0; groupIndex < filters.length; groupIndex++) {
      const group = filters[groupIndex]
      const groupSem: string[] = []
      for (let itemIndex = 0; itemIndex < group.children.length; itemIndex++) {
        const item = group.children[itemIndex]
        const filterConfig: MAFConfig = getMAFConfig(item.id)
        const filterId = filterConfig.id
        if (filterId === null || filterId === undefined || filterId <= 0)
          continue

        const {
          option: filterOption,
          semantic: filterSemantic,
          prepare: filterPrepare,
        } = filterConfig
        const filterMeta: MAFMeta = filterPrepare(item.value, toValue(filterOption))
        const itemOp: string = item.operator ? '且' : '或'
        const itemText: string = filterSemantic(item.value, filterOption, filterMeta, item.opposite)
        if (itemText)
          groupSem.push(itemIndex > 0 ? ` ${itemOp} ${itemText}` : itemText)
      }
      if (groupSem.length > 0) {
        const groupOp: string = (group.operator ? '且' : '或')
        const groupText: string = `${group.opposite ? '非' : ''}(${groupSem.join('')})`
        globalSem.push(groupIndex > 0 ? ` ${groupOp} ${groupText}` : groupText)
      }
    }
    return globalSem.join('')
  })

  const conditionComposed = computed<MAFGroupComposed[]>(() => {
    const groupComposed: MAFGroupComposed[] = []
    const filters = preferenceStore.preference['markerFilter.filter.advancedFilterCache'] ?? []

    // 处理组
    filters.forEach((filter) => {
      const {
        operator: groupOperator = true,
        opposite: groupOpposite = false,
        children = [],
      } = filter
      const itemComposed: MAFItemComposed[] = []

      // 处理子项
      children.forEach((child) => {
        const {
          id = 0,
          operator: itemOperator,
          opposite: itemOpposite,
          value = {},
        } = child
        const {
          option,
          prepare,
          semantic,
          filter,
        } = getMAFConfig(id)
        let meta: MAFMeta = {}
        if (prepare && typeof prepare === 'function')
          meta = prepare(value, toValue(option))
        itemComposed.push({
          id,
          operator: itemOperator,
          opposite: itemOpposite,
          value,
          option,
          meta,
          semantic,
          filter,
        })
      })

      groupComposed.push({
        operator: groupOperator,
        opposite: groupOpposite,
        children: itemComposed,
      })
    })

    return groupComposed
  })

  const conditionCacheCount = computed(() => getCount(preferenceStore.preference['markerFilter.filter.advancedFilterCache']))

  const conditionCount = computed(() => getCount(preferenceStore.preference['markerFilter.filter.advancedFilter']))

  const conditionSame = computed(() => {
    const cache = preferenceStore.preference['markerFilter.filter.advancedFilterCache']
    const filter = preferenceStore.preference['markerFilter.filter.advancedFilter']
    if (cache.length !== filter.length)
      return false
    else if (conditionCacheCount.value !== conditionCount.value)
      return false
    return JSON.stringify(cache) === JSON.stringify(filter)
  })

  const appendConditionGroup = () => {
    preferenceStore.preference['markerFilter.filter.advancedFilterCache'].push(cloneDeep(emptyGroup))
  }

  const initCondition = () => {
    if (preferenceStore.preference['markerFilter.filter.advancedFilterCache'].length <= 0)
      appendConditionGroup()
  }

  const insertConditionGroup = (groupIndex: number) => {
    if (groupIndex > preferenceStore.preference['markerFilter.filter.advancedFilterCache'].length) {
      appendConditionGroup()
      return
    }
    if (groupIndex < 0)
      groupIndex = 0
    preferenceStore.preference['markerFilter.filter.advancedFilterCache'].splice(groupIndex, 0, cloneDeep(emptyGroup))
  }

  const swapConditionGroup = (groupIndexLeft: number, groupIndexRight: number) => {
    const left = preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndexLeft]
    const right = preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndexRight]
    if (left && right) {
      preferenceStore.preference['markerFilter.filter.advancedFilterCache'].splice(groupIndexLeft, 1, right)
      preferenceStore.preference['markerFilter.filter.advancedFilterCache'].splice(groupIndexRight, 1, left)
    }
  }

  const deleteConditionGroup = (groupIndex: number) => {
    if (preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex])
      preferenceStore.preference['markerFilter.filter.advancedFilterCache'].splice(groupIndex, 1)
    initCondition()
  }

  const appendCondition = (groupIndex: number, id: number = 0) => {
    if (preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children) {
      const conditionModel = getMAFConfig(id)
      const newItem: MAFItem = cloneDeep(emptyItem)
      newItem.id = id
      newItem.value = cloneDeep(conditionModel.defaultVal)
      preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children.push(newItem)
    }
  }

  const insertCondition = (groupIndex: number, itemIndex: number, id: number = 0) => {
    if (!preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex])
      return

    if (itemIndex > preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children.length) {
      appendCondition(groupIndex, id)
      return
    }
    if (itemIndex < 0)
      itemIndex = 0
    const conditionModel = getMAFConfig(id)
    const newItem: MAFItem = cloneDeep(emptyItem)
    newItem.id = id
    newItem.value = cloneDeep(conditionModel.defaultVal)
    preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children.splice(itemIndex, 0, newItem)
  }

  const swapCondition = (groupIndex: number, itemIndexLeft: number, itemIndexRight: number) => {
    if (!preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex])
      return

    const left = preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children[itemIndexLeft]
    const right = preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children[itemIndexRight]
    if (left && right) {
      preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children.splice(itemIndexLeft, 1, right)
      preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children.splice(itemIndexRight, 1, left)
    }
  }

  const deleteCondition = (groupIndex: number, itemIndex: number) => {
    if (
      preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex]
      && preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children[itemIndex]
    )
      preferenceStore.preference['markerFilter.filter.advancedFilterCache'][groupIndex].children.splice(itemIndex, 1)
  }

  const copyConditions = () => {
    preferenceStore.preference['markerFilter.filter.advancedFilter'] = cloneDeep(preferenceStore.preference['markerFilter.filter.advancedFilterCache'])
  }

  const clearConditions = () => {
    preferenceStore.preference['markerFilter.filter.advancedFilterCache'] = []
    initCondition()
  }

  return {
    markerAdvancedFilterConfigs: configList,
    markerAdvancedFilterConfigMap: configMap,
    getMAFConfig,

    markerAdvancedFilters: conditions,
    markerAdvancedSemantic: conditionSemanticText,
    markerAdvancedComposed: conditionComposed,
    markerAdvancedCacheCount: conditionCacheCount,
    markerAdvancedCount: conditionCount,
    markerAdvancedSame: conditionSame,
    copyMAFCache: copyConditions,
    clearMAFCache: clearConditions,
    appendMAFGroup: appendConditionGroup,
    insertMAFGroup: insertConditionGroup,
    swapMAFGroup: swapConditionGroup,
    deleteMAFGroup: deleteConditionGroup,
    appendMAFItem: appendCondition,
    insertMAFItem: insertCondition,
    swapMAFItem: swapCondition,
    deleteMAFItem: deleteCondition,
  }
}
