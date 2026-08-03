import type { FilterConditions } from '../types'
import type { FilterPreset, MAFGroup, MBFItem } from '@/stores/types'
import { usePreferenceStore, useUserStore } from '@/stores'
import { usePresetsUnzip, usePresetsZip } from '.'

export interface PresetShareOptions {
  nameToPreview: Ref<string>
  importCallback: (success: boolean) => void
  conditionGetter: ComputedRef<Map<string, MBFItem> | MAFGroup[]>
  presetSaver: (conditions: FilterConditions) => void
}

export const usePresetsShare = (options: PresetShareOptions) => {
  const {
    nameToPreview,
    importCallback,
    conditionGetter,
    presetSaver,
  } = options

  const { shareCode: currentShareCode } = usePresetsZip(conditionGetter)

  const userStore = useUserStore()
  const preferenceStore = usePreferenceStore()

  const previewConditions = computed<FilterPreset | null>(() => {
    const presets = [...preferenceStore.presets]
    const name = nameToPreview.value

    const findIndex = presets.findIndex(preset => preset.name === name)
    const findPreset = presets[findIndex]
    if (findPreset === undefined)
      return null
    return findPreset
  })

  const isUsingFilter = computed(() => previewConditions.value === null)

  const previewBinary = usePresetsZip(computed(() => previewConditions.value?.conditions ?? []))

  const shareCode = computed(() => {
    if (previewConditions.value === null)
      return currentShareCode.value

    return previewBinary.shareCode.value
  })

  const importCodeText = ref<string>('')
  const { conditions: importConditions } = usePresetsUnzip(importCodeText)

  /** 导入预设分享码 */
  const importCode = async (binCode: string) => {
    if (userStore.info?.id === undefined)
      return
    if (!binCode)
      return

    try {
      importCodeText.value = binCode
      presetSaver(importConditions.value)
      importCallback(true)
    }
    catch {
      importCallback(false)
    }
  }

  return {
    shareCode,
    isUsingFilter,
    importCode,
  }
}
