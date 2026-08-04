import type { FilterConditions } from '../types'
import { useUserStore } from '@/stores'
import { usePresetsUnzip } from '.'

export interface PresetImportOptions {
  presetSaver: (conditions: FilterConditions) => void
  importCallback: (success: boolean) => void
}

/** 导入预设分享码 */
export const usePresetsImport = (options: PresetImportOptions) => {
  const { presetSaver, importCallback } = options

  const userStore = useUserStore()

  const importCodeText = ref<string>('')
  const { conditions: importConditions } = usePresetsUnzip(importCodeText)

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
    importCode,
    importConditions,
  }
}
