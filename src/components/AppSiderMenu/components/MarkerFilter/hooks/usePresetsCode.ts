import { usePreferenceStore, useUserStore } from '@/stores'
import type { ExtractFilter, FilterPreset, MAFGroup, MBFItem } from '@/stores/types'
import { Zip, base64ToUint8Array, uint8ArrayToBase64 } from '@/utils'

export interface PresetCodeHookOptions {
  nameToPreview: Ref<string>
  nameToImport: Ref<string>
  importCallback: (success: boolean) => void
  conditionGetter: ComputedRef<Map<string, MBFItem> | MAFGroup[]>
  presetSaver: (conditions: Map<string, MBFItem> | Record<string, MBFItem> | MAFGroup[]) => void
}

type PresetPack =
  | Pick<ExtractFilter<'basic'>, 'type' | 'conditions'>
  | Pick<ExtractFilter<'advanced'>, 'type' | 'conditions'>

export const usePresetsCode = (options: PresetCodeHookOptions) => {
  const {
    nameToPreview,
    nameToImport,
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

  /** 获取预设分享码：当前配置 */
  const getCurrentCode = async () => {
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

    const compressedData = await Zip.compressFrom(object, {
      name: `preset-code-${name}`,
    })
    const base64 = uint8ArrayToBase64(compressedData)
    return base64
  }

  /** 获取预设分享码：基础预设 */
  const getBaseCode = async (conditions: Record<string, MBFItem>) => {
    const name = nameToPreview.value
    const object: PresetPack = {
      type: 'basic' as const,
      conditions,
    }

    const compressedData = await Zip.compressFrom(object, {
      name: `preset-code-${name}`,
    })
    const base64 = uint8ArrayToBase64(compressedData)
    return base64
  }

  /** 获取预设分享码：高级预设 */
  const getAdvancedCode = async (conditions: MAFGroup[]) => {
    const name = nameToPreview.value
    const object: PresetPack = {
      type: 'advanced' as const,
      conditions,
    }

    const compressedData = await Zip.compressFrom(object, {
      name: `preset-code-${name}`,
    })
    const base64 = uint8ArrayToBase64(compressedData)
    return base64
  }

  /** 获取预设分享码 */
  const syncCode = async () => {
    if (previewConditions.value === null)
      return await getCurrentCode()
    else if (previewConditions.value.type === 'basic')
      return await getBaseCode(previewConditions.value.conditions)
    else
      return await getAdvancedCode(previewConditions.value.conditions)
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
  const importCode = async (base64: string) => {
    if (userStore.info?.id === undefined)
      return
    if (!base64)
      return

    try {
      const presets = [...preferenceStore.presets]
      const name = nameToImport.value

      const findIndex = presets.findIndex(preset => preset.name === name)
      const findPreset = presets[findIndex]

      const importName = findPreset === undefined ? '' : name
      const compressedData = base64ToUint8Array(base64)
      const object = await Zip.decompressAs<PresetPack>(compressedData, {
        utfLabel: 'utf-8',
        name: `preset-code-${importName}`,
      })
      presetSaver(object.conditions)
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
