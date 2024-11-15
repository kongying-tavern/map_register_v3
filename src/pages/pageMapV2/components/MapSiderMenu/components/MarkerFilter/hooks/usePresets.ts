import { storeToRefs } from 'pinia'
import { cloneDeep } from 'lodash'
import { usePreferenceStore, useUserInfoStore } from '@/stores'
import type { ExtractFilter, MAFGroup, MBFItem } from '@/stores/types'
import { Zip, base64ToUint8Array, uint8ArrayToBase64 } from '@/utils'

export interface PresetHookOptions {
  nameToSave: Ref<string>
  nameToLoad: Ref<string>
  nameToUpdateCode: Ref<string>
  codeToUpdate: Ref<string>
  codeStatus: Ref<{
    isUsingSelection: boolean
    isGenerating: boolean
    isUpdatable: boolean
  }>
  nameToImportCode: Ref<string>
  codeImportCallback: (success: boolean) => void
  conditionGetter: ComputedRef<Map<string, MBFItem> | MAFGroup[]>
}

type PresetPack =
  | Pick<ExtractFilter<'basic'>, 'type' | 'conditions'>
  | Pick<ExtractFilter<'advanced'>, 'type' | 'conditions'>

export const usePresets = (options: PresetHookOptions) => {
  const {
    nameToSave,
    nameToLoad,
    nameToUpdateCode,
    codeToUpdate,
    codeStatus,
    nameToImportCode,
    codeImportCallback,
    conditionGetter,
  } = options

  const { preference } = storeToRefs(usePreferenceStore())
  const { info } = storeToRefs(useUserInfoStore())

  /** 保存适配器：基础预设 */
  const saveBasePreset = (conditions: Map<string, MBFItem> | Record<string, MBFItem>) => {
    const name = nameToSave.value
    const newConditions = conditions instanceof Map ? Object.fromEntries(conditions.entries()) : conditions
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

  /** 更新预设分享码：当前配置 */
  const updateCurrentPresetCode = async () => {
    const name = ''
    const conditions = conditionGetter.value
    const object: PresetPack = conditions instanceof Map
      ? {
          type: 'basic' as const,
          conditions: Object.fromEntries(conditions.entries()),
        }
      : {
          type: 'advanced' as const,
          conditions,
        }

    codeStatus.value = { ...codeStatus.value, isGenerating: true }
    const compressedData = await Zip.compressFrom(object, {
      name: `preset-code-${name}`,
    })
    const base64 = uint8ArrayToBase64(compressedData)
    codeToUpdate.value = base64
    codeStatus.value = {
      ...codeStatus.value,
      isGenerating: false,
      isUsingSelection: false,
    }
  }

  /** 更新预设分享码：基础预设 */
  const updateBasePresetCode = async (conditions: Record<string, MBFItem>) => {
    const name = nameToUpdateCode.value
    const object: PresetPack = {
      type: 'basic' as const,
      conditions,
    }

    codeStatus.value = { ...codeStatus.value, isGenerating: true }
    const compressedData = await Zip.compressFrom(object, {
      name: `preset-code-${name}`,
    })
    const base64 = uint8ArrayToBase64(compressedData)
    codeToUpdate.value = base64
    codeStatus.value = {
      ...codeStatus.value,
      isGenerating: false,
      isUsingSelection: true,
    }
  }

  /** 更新预设分享码：高级预设 */
  const updateAdvancedPresetCode = async (conditions: MAFGroup[]) => {
    const name = nameToUpdateCode.value
    const object: PresetPack = {
      type: 'advanced' as const,
      conditions,
    }

    codeStatus.value = { ...codeStatus.value, isGenerating: true }
    const compressedData = await Zip.compressFrom(object, {
      name: `preset-code-${name}`,
    })
    const base64 = uint8ArrayToBase64(compressedData)
    codeToUpdate.value = base64
    codeStatus.value = {
      ...codeStatus.value,
      isGenerating: false,
      isUsingSelection: true,
    }
  }

  /** 更新预设分享码 */
  const updatePresetCode = async () => {
    if (info.value.id === undefined)
      return
    if (!codeStatus.value.isUpdatable)
      return
    codeStatus.value.isGenerating = false

    const presets = [...preference.value['markerFilter.setting.presets'] ?? []]
    const name = nameToUpdateCode.value

    const findIndex = presets.findIndex(preset => preset.name === name)
    const findPreset = presets[findIndex]
    if (findPreset === undefined) {
      await updateCurrentPresetCode()
    }
    else {
      findPreset.type === 'basic'
        ? await updateBasePresetCode(findPreset.conditions)
        : await updateAdvancedPresetCode(findPreset.conditions)
    }
    codeStatus.value.isGenerating = false
  }

  /* 监听生成数据变更 */
  watch(() => codeStatus.value.isUpdatable, async () => {
    if (codeStatus.value.isGenerating)
      return
    if (!codeStatus.value.isUpdatable)
      return
    await updatePresetCode()
  })
  watch(nameToUpdateCode, async () => {
    if (codeStatus.value.isGenerating)
      return
    if (!codeStatus.value.isUpdatable)
      return
    await updatePresetCode()
  })

  /** 导入预设分享码 */
  const importPresetCode = async (base64: string) => {
    if (info.value.id === undefined)
      return
    if (!base64)
      return

    try {
      const presets = [...preference.value['markerFilter.setting.presets'] ?? []]
      const name = nameToImportCode.value

      const findIndex = presets.findIndex(preset => preset.name === name)
      const findPreset = presets[findIndex]

      const importName = findPreset === undefined ? '' : name
      const compressedData = base64ToUint8Array(base64)
      const object = await Zip.decompressAs<PresetPack>(compressedData, {
        utfLabel: 'utf-8',
        name: `preset-code-${importName}`,
      })
      object.type === 'basic'
        ? saveBasePreset(object.conditions)
        : saveAdvancedPreset(object.conditions)
      codeImportCallback(true)
    }
    catch {
      codeStatus.value.isGenerating = false
      codeImportCallback(false)
    }
  }

  return {
    savePreset,
    deletePreset,
    loadPreset,
    updatePresetCode,
    importPresetCode,
  }
}
