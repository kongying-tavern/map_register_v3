import { cloneDeep } from 'lodash'
import { storeToRefs } from 'pinia'
import { useMapStateStore, usePreferenceStore } from '@/stores'
import type { MAFConfig, MAFGroup, MAFItem, MAFMeta } from '@/stores/types'
import { getDigest } from '@/utils'

const { getMAFConfig } = useMapStateStore()

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

export const useMarkerFilter = () => {
  const { preference } = storeToRefs(usePreferenceStore())

  const conditionSemanticText = computed<string>(() => {
    const filters = preference.value['markerFilter.filter.advancedFilterCache'] ?? []
    const globalSem: string[] = []
    for (let groupIndex = 0; groupIndex < filters.length; groupIndex++) {
      const group = filters[groupIndex]
      const groupSem: string[] = []
      for (let itemIndex = 0; itemIndex < group.children.length; itemIndex++) {
        const item = group.children[itemIndex]
        const filterConfig: MAFConfig = getMAFConfig(item.id)
        const {
          option: filterOption,
          semantic: filterSemantic,
          prepare: filterPrepare,
        } = filterConfig
        const filterMeta: MAFMeta = filterPrepare(item.value)
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

  const getHash = (filters: MAFGroup[] = []): Promise<string> => {
    if (filters.length <= 0)
      return Promise.resolve('')
    const filtersBlob = new Blob([JSON.stringify(filters)], { type: 'text/plain' })
    return getDigest(filtersBlob, 'SHA-1')
  }

  const conditionCacheHash = asyncComputed(async () => await getHash(preference.value['markerFilter.filter.advancedFilterCache'] ?? []))

  const conditionHash = asyncComputed(async () => await getHash(preference.value['markerFilter.filter.advancedFilter'] ?? []))

  const conditionHashSame = computed(() => conditionCacheHash.value === conditionHash.value)

  const copyConditions = () => {
    preference.value['markerFilter.filter.advancedFilter'] = cloneDeep(preference.value['markerFilter.filter.advancedFilterCache'])
  }

  const appendConditionGroup = () => {
    preference.value['markerFilter.filter.advancedFilterCache'].push(cloneDeep(emptyGroup))
  }

  const insertConditionGroup = (groupIndex: number) => {
    if (groupIndex > preference.value['markerFilter.filter.advancedFilterCache'].length) {
      appendConditionGroup()
      return
    }
    if (groupIndex < 0)
      groupIndex = 0
    preference.value['markerFilter.filter.advancedFilterCache'].splice(groupIndex, 0, cloneDeep(emptyGroup))
  }

  const swapConditionGroup = (groupIndexLeft: number, groupIndexRight: number) => {
    const left = preference.value['markerFilter.filter.advancedFilterCache'][groupIndexLeft]
    const right = preference.value['markerFilter.filter.advancedFilterCache'][groupIndexRight]
    if (left && right) {
      preference.value['markerFilter.filter.advancedFilterCache'].splice(groupIndexLeft, 1, right)
      preference.value['markerFilter.filter.advancedFilterCache'].splice(groupIndexRight, 1, left)
    }
  }

  const deleteConditionGroup = (groupIndex: number) => {
    if (preference.value['markerFilter.filter.advancedFilterCache'][groupIndex])
      preference.value['markerFilter.filter.advancedFilterCache'].splice(groupIndex, 1)
  }

  const appendCondition = (groupIndex: number, id: number = 0) => {
    if (preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children) {
      const conditionModel = getMAFConfig(id)
      const newItem: MAFItem = cloneDeep(emptyItem)
      newItem.id = id
      newItem.value = cloneDeep(conditionModel.defaultVal)
      preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children.push(newItem)
    }
  }

  const insertCondition = (groupIndex: number, itemIndex: number, id: number = 0) => {
    if (!preference.value['markerFilter.filter.advancedFilterCache'][groupIndex])
      return

    if (itemIndex > preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children.length) {
      appendCondition(groupIndex, id)
      return
    }
    if (itemIndex < 0)
      itemIndex = 0
    const conditionModel = getMAFConfig(id)
    const newItem: MAFItem = cloneDeep(emptyItem)
    newItem.id = id
    newItem.value = cloneDeep(conditionModel.defaultVal)
    preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children.splice(itemIndex, 0, newItem)
  }

  const swapCondition = (groupIndex: number, itemIndexLeft: number, itemIndexRight: number) => {
    if (!preference.value['markerFilter.filter.advancedFilterCache'][groupIndex])
      return

    const left = preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children[itemIndexLeft]
    const right = preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children[itemIndexRight]
    if (left && right) {
      preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children.splice(itemIndexLeft, 1, right)
      preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children.splice(itemIndexRight, 1, left)
    }
  }

  const deleteCondition = (groupIndex: number, itemIndex: number) => {
    if (
      preference.value['markerFilter.filter.advancedFilterCache'][groupIndex]
      && preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children[itemIndex]
    )
      preference.value['markerFilter.filter.advancedFilterCache'][groupIndex].children.splice(itemIndex, 1)
  }

  const clearCondition = () => {
    preference.value['markerFilter.filter.advancedFilterCache'] = []
  }

  return {
    conditionSemanticText,
    conditionCacheHash,
    conditionHash,
    conditionHashSame,

    copyConditions,

    appendConditionGroup,
    insertConditionGroup,
    swapConditionGroup,
    deleteConditionGroup,
    appendCondition,
    insertCondition,
    swapCondition,
    deleteCondition,
    clearCondition,
  }
}
