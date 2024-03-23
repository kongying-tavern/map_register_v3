import { storeToRefs } from 'pinia'
import { cloneDeep } from 'lodash'
import { usePreferenceStore, useUserInfoStore } from '@/stores'
import type { MAFGroup, MBFItem } from '@/stores/types'

export interface PresetHookOptions {
  nameToSave: Ref<string>
  nameToLoad: Ref<string>
  conditionGetter: ComputedRef<Map<string, MBFItem> | MAFGroup[]>
}

export const usePresets = (options: PresetHookOptions) => {
  const { nameToSave, nameToLoad, conditionGetter } = options

  const { preference } = storeToRefs(usePreferenceStore())
  const { info } = storeToRefs(useUserInfoStore())

  /** 保存适配器：基础预设 */
  const saveBasePreset = (conditions: Map<string, MBFItem>) => {
    const name = nameToSave.value
    const newConditions = Object.fromEntries(conditions.entries())
    const presetList = [...preference.value['markerFilter.setting.presets'] ?? []]

    const object = {
      name,
      type: 'basic' as const,
      conditions: newConditions,
    }

    const findIndex = presetList.findIndex(preset => preset.name === name)
    if (findIndex < 0)
      presetList.push(object)
    else
      presetList.splice(findIndex, 1, object)

    preference.value['markerFilter.setting.presets'] = presetList
    nameToSave.value = ''
  }

  /** 保存适配器：高级预设 */
  const saveAdvancedPreset = (conditions: MAFGroup[]) => {
    const name = nameToSave.value
    const presetList = [...preference.value['markerFilter.setting.presets'] ?? []]

    const object = {
      name,
      type: 'advanced' as const,
      conditions,
    }

    const findIndex = presetList.findIndex(preset => preset.name === name)
    if (findIndex < 0)
      presetList.push(object)
    else
      presetList.splice(findIndex, 1, object)

    preference.value['markerFilter.setting.presets'] = presetList
    nameToSave.value = ''
  }

  /** 保存预设 */
  const savePreset = () => {
    if (info.value.id === undefined)
      return

    const conditions = conditionGetter.value
    conditions instanceof Map
      ? saveBasePreset(conditions)
      : saveAdvancedPreset(conditions)
  }

  /** 删除预设 */
  const deletePreset = () => {
    if (info.value.id === undefined)
      return

    const presets = [...preference.value['markerFilter.setting.presets'] ?? []]
    const name = nameToLoad.value

    const findIndex = presets.findIndex(preset => preset.name === name)
    if (findIndex < 0)
      return

    presets.splice(findIndex, 1)

    preference.value['markerFilter.setting.presets'] = presets
  }

  /** 读取适配器：基础预设 */
  const loadBasePreset = (conditions: Record<string, MBFItem>) => {
    const itemIds: number[] = []

    // 读取最后条件的选择地区和类型作为筛选器当前状态
    let latestAreaCode: string | undefined
    let latestTypeId: number | undefined
    for (const key in conditions) {
      const condition = conditions[key]
      itemIds.push(...condition.items)
      latestAreaCode = condition.area.code
      latestTypeId = condition.type.id
    }

    preference.value['markerFilter.setting.filterType'] = 'basic'
    if (latestAreaCode !== undefined) {
      const { 1: zone } = latestAreaCode.split(':')
      preference.value['markerFilter.state.parentAreaCode'] = `C:${zone}`
      preference.value['markerFilter.state.areaCode'] = latestAreaCode
    }
    if (latestTypeId !== undefined)
      preference.value['markerFilter.state.itemTypeId'] = latestTypeId
    preference.value['markerFilter.state.itemIds'] = itemIds
    preference.value['markerFilter.state.step'] = 2
  }

  /** 读取适配器：高级预设 */
  const loadAdvancedPreset = (conditions: MAFGroup[]) => {
    preference.value['markerFilter.setting.filterType'] = 'advanced'
    preference.value['markerFilter.filter.advancedFilter'] = conditions
    preference.value['markerFilter.filter.advancedFilterCache'] = cloneDeep(conditions)
  }

  /** 读取预设 */
  const loadPreset = () => {
    if (info.value.id === undefined)
      return

    const presetList = preference.value['markerFilter.setting.presets'] ?? []
    const name = nameToLoad.value

    const findIndex = presetList.findIndex(preset => preset.name === name)
    if (findIndex < 0)
      return

    const { conditions, type } = presetList[findIndex]
    type === 'basic'
      ? loadBasePreset(conditions)
      : loadAdvancedPreset(conditions)
  }

  return {
    savePreset,
    deletePreset,
    loadPreset,
  }
}
