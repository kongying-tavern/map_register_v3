import { cloneDeep } from 'lodash'
import { storeToRefs } from 'pinia'
import { useMapStateStore, usePreferenceStore } from '@/stores'
import type { MAFGroup, MAFItem } from '@/stores/types'

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

  const appendConditionGroup = () => {
    preference.value['markerFilter.filter.advancedFilter'].push(cloneDeep(emptyGroup))
  }

  const insertConditionGroup = (groupIndex: number) => {
    if (groupIndex > preference.value['markerFilter.filter.advancedFilter'].length) {
      appendConditionGroup()
      return
    }
    if (groupIndex < 0)
      groupIndex = 0
    preference.value['markerFilter.filter.advancedFilter'].splice(groupIndex, 0, cloneDeep(emptyGroup))
  }

  const swapConditionGroup = (groupIndexLeft: number, groupIndexRight: number) => {
    const left = preference.value['markerFilter.filter.advancedFilter'][groupIndexLeft]
    const right = preference.value['markerFilter.filter.advancedFilter'][groupIndexRight]
    if (left && right) {
      preference.value['markerFilter.filter.advancedFilter'].splice(groupIndexLeft, 1, right)
      preference.value['markerFilter.filter.advancedFilter'].splice(groupIndexRight, 1, left)
    }
  }

  const deleteConditionGroup = (groupIndex: number) => {
    if (preference.value['markerFilter.filter.advancedFilter'][groupIndex])
      preference.value['markerFilter.filter.advancedFilter'].splice(groupIndex, 1)
  }

  const appendCondition = (groupIndex: number, id: number = 0) => {
    if (preference.value['markerFilter.filter.advancedFilter'][groupIndex].children) {
      const conditionModel = getMAFConfig(id)
      const newItem: MAFItem = cloneDeep(emptyItem)
      newItem.id = id
      newItem.value = cloneDeep(conditionModel.defaultVal)
      preference.value['markerFilter.filter.advancedFilter'][groupIndex].children.push(newItem)
    }
  }

  const insertCondition = (groupIndex: number, itemIndex: number, id: number = 0) => {
    if (!preference.value['markerFilter.filter.advancedFilter'][groupIndex])
      return

    if (itemIndex > preference.value['markerFilter.filter.advancedFilter'][groupIndex].children.length) {
      appendCondition(groupIndex, id)
      return
    }
    if (itemIndex < 0)
      itemIndex = 0
    const conditionModel = getMAFConfig(id)
    const newItem: MAFItem = cloneDeep(emptyItem)
    newItem.id = id
    newItem.value = cloneDeep(conditionModel.defaultVal)
    preference.value['markerFilter.filter.advancedFilter'][groupIndex].children.splice(itemIndex, 0, newItem)
  }

  const swapCondition = (groupIndex: number, itemIndexLeft: number, itemIndexRight: number) => {
    if (!preference.value['markerFilter.filter.advancedFilter'][groupIndex])
      return

    const left = preference.value['markerFilter.filter.advancedFilter'][groupIndex].children[itemIndexLeft]
    const right = preference.value['markerFilter.filter.advancedFilter'][groupIndex].children[itemIndexRight]
    if (left && right) {
      preference.value['markerFilter.filter.advancedFilter'][groupIndex].children.splice(itemIndexLeft, 1, right)
      preference.value['markerFilter.filter.advancedFilter'][groupIndex].children.splice(itemIndexRight, 1, left)
    }
  }

  const deleteCondition = (groupIndex: number, itemIndex: number) => {
    if (
      preference.value['markerFilter.filter.advancedFilter'][groupIndex]
      && preference.value['markerFilter.filter.advancedFilter'][groupIndex].children[itemIndex]
    )
      preference.value['markerFilter.filter.advancedFilter'][groupIndex].children.splice(itemIndex, 1)
  }

  const clearCondition = () => {
    preference.value['markerFilter.filter.advancedFilter'] = []
  }

  return {
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
