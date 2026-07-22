import type { FilterConditions } from '../types'
import type { FilterPreset, MAFGroup, MBFItem } from '@/stores/types'
import { decode, encode } from 'base32768'
import { usePreferenceStore, useUserStore } from '@/stores'

export interface PresetCodeHookOptions {
  nameToPreview: Ref<string>
  importCallback: (success: boolean) => void
  conditionGetter: ComputedRef<Map<string, MBFItem> | MAFGroup[]>
  presetSaver: (conditions: FilterConditions) => void
}

export const usePresetsCode = (options: PresetCodeHookOptions) => {
  const {
    nameToPreview,
    importCallback,
    conditionGetter,
    presetSaver,
  } = options

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

  /** 压缩预设条件 */
  const zipCode = (_conditions: FilterConditions): Uint8Array => {
    // TODO: embed type marker + encode conditions
    return new Uint8Array()
  }

  /** 解压预设条件 */
  const unzipCode = (_zipped: Uint8Array): FilterConditions => {
    // TODO: read type marker from binary, decode conditions
    return new Map()
  }

  /** 获取预设分享码：当前配置 */
  const getCurrentCode = () => {
    const conditions = conditionGetter.value
    return encode(zipCode(conditions))
  }

  /** 获取预设分享码：基础预设 */
  const getBaseCode = (conditions: Record<string, MBFItem>) => {
    return encode(zipCode(conditions))
  }

  /** 获取预设分享码：高级预设 */
  const getAdvancedCode = (conditions: MAFGroup[]) => {
    return encode(zipCode(conditions))
  }

  /** 获取预设分享码 */
  const syncCode = () => {
    if (previewConditions.value === null)
      return getCurrentCode()
    else if (previewConditions.value.type === 'basic')
      return getBaseCode(previewConditions.value.conditions)
    else
      return getAdvancedCode(previewConditions.value.conditions)
  }

  const shareCode = ref<string>('')

  /** 监听预览条件，更新分享码 */
  watch(previewConditions, async () => {
    shareCode.value = await syncCode()
  })

  onMounted(async () => {
    shareCode.value = await syncCode()
  })

  /** 导入预设分享码 */
  const importCode = async (binCode: string) => {
    if (userStore.info?.id === undefined)
      return
    if (!binCode)
      return

    try {
      const data = decode(binCode)
      const conditions = unzipCode(data)
      presetSaver(conditions)
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
