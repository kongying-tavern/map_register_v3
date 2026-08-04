import type { FilterConditions } from '../types'
import { useUserStore } from '@/stores'
import { usePresetsUnzip } from '.'

export interface PresetImportOptions {
  code?: MaybeRef<string>
  presetSaver: (conditions: FilterConditions) => void
  importCallback: (success: boolean) => void
}

/** 导入预设分享码 */
export const usePresetsImport = (options: PresetImportOptions) => {
  const { presetSaver, importCallback } = options

  const userStore = useUserStore()

  const code = options.code ?? shallowRef<string>('')
  const { conditions: importConditions } = usePresetsUnzip(code)

  const importCode = () => {
    if (userStore.info?.id === undefined)
      return
    if (!unref(code))
      return

    try {
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
