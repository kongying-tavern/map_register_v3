import { cloneDeep } from 'lodash'
import { storeToRefs } from 'pinia'
import { usePreferenceStore } from '@/stores'
import type { ConditionAdvanced, ConditionAdvancedItem } from '@/stores/types'

const emptyGroup: ConditionAdvanced = {
  operator: true,
  opposite: false,
  children: [],
}

const emptyItem: ConditionAdvancedItem = {
  id: 0,
  operator: true,
  opposite: false,
  value: {},
}

export const useMarkerFilterAdvanced = () => {
  const { preference } = storeToRefs(usePreferenceStore())

  const conditions = computed(() => preference.value['markerFilter.filter.advancedFilter'])

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

  const appendCondition = (groupIndex: number) => {
    if (preference.value['markerFilter.filter.advancedFilter'][groupIndex].children)
      preference.value['markerFilter.filter.advancedFilter'][groupIndex].children.push(cloneDeep(emptyItem))
  }

  const insertCondition = (groupIndex: number, itemIndex: number) => {
    if (!preference.value['markerFilter.filter.advancedFilter'][groupIndex])
      return

    if (itemIndex > preference.value['markerFilter.filter.advancedFilter'][groupIndex].children.length
    ) {
      appendCondition(groupIndex)
      return
    }
    if (itemIndex < 0)
      itemIndex = 0
    preference.value['markerFilter.filter.advancedFilter'][groupIndex].children.splice(itemIndex, 0, cloneDeep(emptyItem))
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
    conditions,

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
