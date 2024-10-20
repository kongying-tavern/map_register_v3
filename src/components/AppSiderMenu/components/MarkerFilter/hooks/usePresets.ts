import { cloneDeep } from 'lodash'
import { usePreferenceStore, useUserStore } from '@/stores'
import type { MAFGroup, MBFItem } from '@/stores/types'

export interface PresetHookOptions {
  nameToSave: Ref<string>
  nameToLoad: Ref<string>
  conditionGetter: ComputedRef<Map<string, MBFItem> | MAFGroup[]>
}

export const usePresets = (options: PresetHookOptions) => {
  const { nameToSave, nameToLoad, conditionGetter } = options

  const userStore = useUserStore()
  const preferenceStore = usePreferenceStore()

  /** 保存适配器：基础预设 */
  const saveBasePreset = (conditions: Map<string, MBFItem>) => {
    const name = nameToSave.value
    const newConditions = Object.fromEntries(conditions.entries())
    const presetList = [...preferenceStore.presets]

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

    preferenceStore.presets = presetList
    nameToSave.value = ''
  }

  /** 保存适配器：高级预设 */
  const saveAdvancedPreset = (conditions: MAFGroup[]) => {
    const name = nameToSave.value
    const presetList = [...preferenceStore.presets]

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

    preferenceStore.presets = presetList
    nameToSave.value = ''
  }

  /** 保存预设 */
  const savePreset = () => {
    if (userStore.info?.id === undefined)
      return

    const conditions = conditionGetter.value
    conditions instanceof Map
      ? saveBasePreset(conditions)
      : saveAdvancedPreset(conditions)
  }

  /** 删除预设 */
  const deletePreset = () => {
    if (userStore.info?.id === undefined)
      return

    const newPresets = [...preferenceStore.presets]
    const name = nameToLoad.value

    const findIndex = newPresets.findIndex(preset => preset.name === name)
    if (findIndex < 0)
      return

    newPresets.splice(findIndex, 1)

    preferenceStore.presets = newPresets
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

    preferenceStore.filterType = 'basic'
    if (latestAreaCode !== undefined) {
      const { 1: zone } = latestAreaCode.split(':')
      preferenceStore.parentAreaCode = `C:${zone}`
      preferenceStore.areaCode = latestAreaCode
    }
    if (latestTypeId !== undefined)
      preferenceStore.itemTypeId = latestTypeId
    preferenceStore.itemIds = itemIds
    preferenceStore.step = 2
  }

  /** 读取适配器：高级预设 */
  const loadAdvancedPreset = (conditions: MAFGroup[]) => {
    preferenceStore.filterType = 'advanced'
    preferenceStore.advancedFilter = conditions
    preferenceStore.advancedFilterCache = cloneDeep(conditions)
  }

  /** 读取预设 */
  const loadPreset = () => {
    if (userStore.info?.id === undefined)
      return

    const name = nameToLoad.value

    const findIndex = preferenceStore.presets.findIndex(preset => preset.name === name)
    if (findIndex < 0)
      return

    const { conditions, type } = preferenceStore.presets[findIndex]
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
