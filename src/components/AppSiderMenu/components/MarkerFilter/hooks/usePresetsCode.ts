import { useAreaStore, useItemTypeStore, usePreferenceStore, useUserStore } from '@/stores'
import type { FilterPreset, MAFGroup, MAFItem, MBFItem } from '@/stores/types'
import { Zip, base64ToUint8Array, strToUint8, uint32ToUint8, uint8ArrayToBase64, uint8ToStr, uint8ToUint32 } from '@/utils'

export interface PresetCodeHookOptions {
  nameToPreview: Ref<string>
  nameToImport: Ref<string>
  importCallback: (success: boolean) => void
  conditionGetter: ComputedRef<Map<string, MBFItem> | MAFGroup[]>
  presetSaver: (conditions: Map<string, MBFItem> | Record<string, MBFItem> | MAFGroup[]) => void
}

interface PresetPack {
  type: 'basic' | 'advanced'
  conditions: string
}

const ADVANCED_OPPOSITE_MASK = 0b1000_0000
const ADVANCED_OPERATOR_MASK = 0b0000_0001
const ADVANCED_NULL_MASK = 0b0000_0000

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
  const areaStore = useAreaStore()
  const itemTypeStore = useItemTypeStore()

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

  /** 压缩预设条件：基础预设 */
  const zipBaseCode = (conditions: Map<string, MBFItem> | Record<string, MBFItem>): Uint8Array => {
    const newConditions = conditions instanceof Map ? conditions : new Map(Object.entries(conditions))
    const chunks: Uint8Array[] = []
    newConditions
      .entries()
      .forEach(([k, v]) => {
        const key = strToUint8(k)
        const keyLength = uint32ToUint8(key.byteLength)
        const areaId = uint32ToUint8(v.area.id ?? 0)
        const typeId = uint32ToUint8(v.type.id ?? 0)
        const itemLength = uint32ToUint8(v.items.length)
        const itemIds = v.items.map(itemId => uint32ToUint8(itemId))
        chunks.splice(chunks.length, 0, ...[keyLength, key, areaId, typeId, itemLength, ...itemIds])
      })

    const chunksInt = chunks.reduce<number[]>((arr, uint) => arr.concat(Array.from(uint)), [] as number[])
    return Uint8Array.from(chunksInt)
  }

  /** 压缩预设条件：高级预设 */
  const zipAdvancedCode = (conditions: MAFGroup[]): Uint8Array => {
    const chunks: Uint8Array[] = []
    conditions
      .forEach((group) => {
        let groupMask = 0
        groupMask |= group.opposite ? ADVANCED_OPPOSITE_MASK : ADVANCED_NULL_MASK
        groupMask |= group.operator ? ADVANCED_OPERATOR_MASK : ADVANCED_NULL_MASK
        const groupMaskBuf = Uint8Array.from([groupMask])
        const groupLength = uint32ToUint8(group.children.length)
        chunks.splice(chunks.length, 0, ...[groupMaskBuf, groupLength])

        group.children.forEach((item) => {
          const itemId = Uint8Array.from([item.id])
          let itemMask = 0
          itemMask |= item.opposite ? ADVANCED_OPPOSITE_MASK : ADVANCED_NULL_MASK
          itemMask |= item.operator ? ADVANCED_OPERATOR_MASK : ADVANCED_NULL_MASK
          const itemMaskBuf = Uint8Array.from([itemMask])
          const itemVal = strToUint8(JSON.stringify(item.value))
          const itemValLength = uint32ToUint8(itemVal.byteLength)
          chunks.splice(chunks.length, 0, ...[itemId, itemMaskBuf, itemValLength, itemVal])
        })
      })

    const chunksInt = chunks.reduce<number[]>((arr, uint) => arr.concat(Array.from(uint)), [] as number[])
    return Uint8Array.from(chunksInt)
  }

  /** 解压预设条件：基础预设 */
  const unzipBaseCode = (zipped: Uint8Array): Map<string, MBFItem> => {
    const conditions = new Map<string, MBFItem>()
    let pointer = 0
    while (pointer <= zipped.byteLength) {
      const keyLength = uint8ToUint32(zipped.slice(pointer, pointer + 4))
      pointer += 4
      const key = uint8ToStr(zipped.slice(pointer, pointer + keyLength))
      pointer += keyLength
      const areaId = uint8ToUint32(zipped.slice(pointer, pointer + 4))
      pointer += 4
      const typeId = uint8ToUint32(zipped.slice(pointer, pointer + 4))
      pointer += 4
      const itemLength = uint8ToUint32(zipped.slice(pointer, pointer + 4))
      pointer += 4
      const itemIdsBuffer = zipped.slice(pointer, pointer + itemLength * 4)
      pointer += itemLength * 4
      const itemIds = itemIdsBuffer.reduce((arr, _uint, index, uintArr) => arr.concat(uint8ToUint32(uintArr.slice(index * 4, index * 4 + 4))), [] as number[])

      const area = areaStore.areaIdMap.get(areaId) ?? {} as API.AreaVo
      const type = itemTypeStore.itemTypeIdMap.get(typeId) ?? {} as API.ItemTypeVo
      conditions.set(key, { area, type, items: itemIds })
    }

    return conditions
  }

  /** 解压预设条件：高级预设 */
  const unzipAdvancedCode = (zipped: Uint8Array): MAFGroup[] => {
    const conditions: MAFGroup[] = []
    let pointer = 0
    while (pointer <= zipped.byteLength) {
      const group: MAFGroup = {
        key: crypto.randomUUID(),
        opposite: false,
        operator: true,
        children: [],
      }
      const groupMask = zipped[pointer] ?? 0
      pointer++
      group.opposite = (groupMask & ADVANCED_OPPOSITE_MASK) > 0
      group.operator = (groupMask & ADVANCED_OPERATOR_MASK) > 0
      const groupLength = uint8ToUint32(zipped.slice(pointer, pointer + 4))
      pointer += 4

      for (let i = 0; i < groupLength; i++) {
        const item: MAFItem = {
          id: 0,
          key: crypto.randomUUID(),
          opposite: false,
          operator: true,
          value: {},
        }
        item.id = zipped[pointer] ?? 0
        pointer++
        const itemMask = zipped[pointer] ?? 0
        pointer++
        item.opposite = (itemMask & ADVANCED_OPPOSITE_MASK) > 0
        item.operator = (itemMask & ADVANCED_OPERATOR_MASK) > 0
        const itemValLength = uint8ToUint32(zipped.slice(pointer, pointer + 4))
        pointer += 4
        const itemVal = uint8ToStr(zipped.slice(pointer, pointer + itemValLength))
        pointer += itemValLength
        try {
          item.value = JSON.parse(itemVal)
        }
        catch {
          // skip
        }
        group.children.push(item)
      }
      conditions.push(group)
    }

    return conditions
  }

  /** 获取预设分享码：当前配置 */
  const getCurrentCode = async () => {
    const name = ''
    const conditions = conditionGetter.value
    const object: PresetPack = conditions instanceof Map
      ? {
          type: 'basic' as const,
          conditions: uint8ArrayToBase64(zipBaseCode(conditions)),
        }
      : {
          type: 'advanced' as const,
          conditions: uint8ArrayToBase64(zipAdvancedCode(conditions)),
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
      conditions: uint8ArrayToBase64(zipBaseCode(conditions)),
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
      conditions: uint8ArrayToBase64(zipAdvancedCode(conditions)),
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
      object.type === 'basic'
        ? presetSaver(unzipBaseCode(base64ToUint8Array(object.conditions)))
        : presetSaver(unzipAdvancedCode(base64ToUint8Array(object.conditions)))
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
