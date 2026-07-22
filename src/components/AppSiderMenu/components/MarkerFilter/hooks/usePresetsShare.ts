import type { FilterConditions } from '../types'
import type { FilterPreset, MAFGroup, MBFItem } from '@/stores/types'
import { usePreferenceStore, useUserStore } from '@/stores'
import { usePresetsCode } from '.'
import { PresetsUnzipper, PresetsZipper } from '../utils'

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

  const { shareCode: currentShareCode } = usePresetsCode(conditionGetter)

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

  const shareCode = computed(() => {
    if (previewConditions.value === null)
      return currentShareCode.value

    const zipper = new PresetsZipper()
    return zipper.zipToCode(previewConditions.value.conditions)
  })

  /** 导入预设分享码 */
  const importCode = async (binCode: string) => {
    if (userStore.info?.id === undefined)
      return
    if (!binCode)
      return

    try {
      const unzipper = new PresetsUnzipper()
      presetSaver(unzipper.unzipFromCode(binCode))
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
