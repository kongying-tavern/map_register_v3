import { TextModifier } from '../core/modifiers'
import type { Modifier, ModifierConstructorOptions } from '../core'
import { Logger, messageFrom } from '@/utils'
import type { GSMapState } from '@/stores/types/genshin-map-state'

interface ModifierConstructor {
  new(options: ModifierConstructorOptions): Modifier
}

const createFactory = (ModifierClass: ModifierConstructor, options: Omit<ModifierConstructorOptions, 'type'>) => {
  return (type: string) => new ModifierClass({ ...options, type })
}

const modifierMap = new Map<string, (type: string) => Modifier>()
  .set('title', createFactory(TextModifier, {
    field: 'markerTitle',
    label: '点位标题',
  }))
  .set('content', createFactory(TextModifier, {
    field: 'content',
    label: '描述内容',
  }))

interface TweakControlInfo {
  id: string
  modifier: Modifier
}

const textCommonOptions = [
  {
    label: '更新',
    value: 'update',
  },
  {
    label: '文本替换',
    value: 'replace',
  },
  {
    label: '正则替换',
    value: 'replaceRegex',
  },
  {
    label: '在开头插入',
    value: 'prepend',
  },
  {
    label: '在结尾插入',
    value: 'append',
  },
  {
    label: '去除开头空白字符',
    value: 'trimLeft',
  },
  {
    label: '去除结尾空白字符',
    value: 'trimRight',
  },
  {
    label: '从开头移除文本',
    value: 'removeLeft',
  },
  {
    label: '从结尾移除文本',
    value: 'removeRight',
  },
]

const options = [
  {
    label: '点位标题',
    value: 'title',
    children: textCommonOptions,
  },
  {
    label: '描述内容',
    value: 'content',
    children: textCommonOptions,
  },
  {
    label: '刷新时间',
    value: 'refreshTime',
    disabled: true,
    children: [
      { label: '更新', value: 'update' },
    ],
  },
  {
    label: '可见范围',
    value: 'hiddenFlag',
    disabled: true,
    children: [
      { label: '更新', value: 'update' },
    ],
  },
  {
    label: '额外数据',
    value: 'extra',
    disabled: true,
    children: [
      { label: '合并', value: 'merge' },
    ],
  },
  {
    label: '物品关联',
    value: 'itemList',
    disabled: true,
    children: [
      { label: '更新', value: 'update' },
      { label: '不存在时插入', value: 'insertIfAbsent' },
      { label: '插入或更新', value: 'insertOrUpdate' },
      { label: '删除条目', value: 'removeItem' },
      { label: '保留条目', value: 'preserveItem' },
    ],
  },
]

export const useTweaks = (markerList: ComputedRef<GSMapState.MarkerWithRenderConfig[]>) => {
  const logger = new Logger('批量修改')

  const tweakList = shallowRef<TweakControlInfo[]>([])
  const tweakData = ref(new Map<string, API.TweakConfigMetaVo>())
  const selectedIndex = ref(-1)

  const modifiedMarkerList = computed(() => {
    const previewTweakList = tweakList.value.slice(0, selectedIndex.value + 1)
    return markerList.value.map(marker => previewTweakList.reduce(({ newData }, { modifier, id }) => ({
      oldData: newData,
      newData: modifier.modify(newData, tweakData.value.get(id)!),
    }), { oldData: marker, newData: marker }))
  })

  const selectedModifier = computed(() => {
    if (selectedIndex.value < 0)
      return
    return tweakList.value[selectedIndex.value].modifier
  })

  const selectedMeta = computed(() => {
    if (selectedIndex.value < 0)
      return
    return tweakData.value.get(tweakList.value[selectedIndex.value].id)!
  })

  const createTweak = (value?: string[]) => {
    try {
      if (!value || value.length < 2)
        return

      const [prop, type] = value

      const modifierFactory = modifierMap.get(prop)
      if (!modifierFactory)
        throw new Error(`字段 "${prop}" 的修改器实例不存在`)

      const modifier = modifierFactory(type)
      const id = crypto.randomUUID()

      tweakList.value = [...tweakList.value, {
        id,
        modifier,
      }]
      tweakData.value.set(id, {})

      selectedIndex.value = tweakList.value.length - 1
    }
    catch (err) {
      logger.error(messageFrom(err))
    }
  }

  const deleteTweak = (index: number) => {
    const list = [...tweakList.value]
    const tweak = list[index]
    if (!tweak)
      return
    list.splice(index, 1)
    selectedIndex.value = selectedIndex.value >= list.length
      ? selectedIndex.value - 1
      : selectedIndex.value
    tweakList.value = list
    tweakData.value.delete(tweak.id)
  }

  const clearTweaks = () => {
    selectedIndex.value = -1
    tweakList.value = []
    tweakData.value.clear()
  }

  return {
    tweakList,
    tweakData,
    tweakOptions: options,
    modifiedMarkerList,
    selectedIndex,
    selectedModifier,
    selectedMeta,
    createTweak,
    deleteTweak,
    clearTweaks,
  }
}
