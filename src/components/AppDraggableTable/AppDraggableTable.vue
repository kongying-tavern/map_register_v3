<script setup lang="ts" generic="T">
const props = withDefaults(defineProps<{
  getKey?: (data: T) => string
  transitionDuration?: number
}>(), {
  transitionDuration: 150,
})

const emits = defineEmits<{
  change: [T[]]
}>()

defineSlots<{
  default: (props: {
    item: T
    index: number
    isDragging: boolean
    isGrabbing: boolean
  }) => Component[]
}>()

interface KeyData {
  _raw: T
  key: string
}

const modelValue = defineModel<T[]>('modelValue', {
  required: false,
  default: () => [],
})

/** 拖拽识别 id */
const DRAG_ID = [...crypto.getRandomValues(new Uint8Array(5))].map(num => num.toString(16).padStart(2, '0')).join('')

const isDragging = ref(false)

const sourceData = ref<KeyData>()
const targetData = ref<KeyData>()

const initShadowList = (list: T[]): KeyData[] => list.map((value, index) => ({
  _raw: value,
  key: props.getKey ? props.getKey(value) : `${index}`,
}))

const shadowData = ref(initShadowList(modelValue.value)) as Ref<KeyData[]>

const dataKeyMap = computed(() => shadowData.value.reduce((map, data) => {
  return map.set(data.key, data)
}, new Map<string, KeyData>()))

const isInternalUpdate = ref(false)

watch(() => modelValue.value, (list) => {
  if (isInternalUpdate.value) {
    isInternalUpdate.value = false
    return
  }
  shadowData.value = initShadowList(list)
}, { deep: true })

const handleDragStart = (ev: DragEvent) => {
  const result = ev
    .composedPath()
    .find((target) => {
      return target instanceof HTMLElement && target.dataset.dragId === DRAG_ID
    }) as HTMLElement | undefined
  if (!result)
    return

  const { key = '' } = result.dataset
  const data = dataKeyMap.value.get(key)
  if (!data)
    return

  sourceData.value = data
  isDragging.value = true
}

const handleDragEnd = () => {
  sourceData.value = undefined
  targetData.value = undefined
  isDragging.value = false
  const result = shadowData.value.map(({ _raw }) => _raw)
  modelValue.value = result
  emits('change', result)
}

const move = (fromIndex: number, toIndex: number) => {
  const element = shadowData.value.splice(fromIndex, 1)[0]
  shadowData.value.splice(toIndex, 0, element)
  targetData.value = undefined
}

const getDragWrapper = (target: EventTarget | null): HTMLElement | undefined => {
  if (!target)
    return

  if (!(target instanceof HTMLElement))
    return

  if (target.dataset.dragId === DRAG_ID)
    return target

  return getDragWrapper(target.parentElement)
}

const handleDragEnter = useDebounceFn((ev: DragEvent) => {
  const result = getDragWrapper(ev.target)

  if (!result || !sourceData.value)
    return

  const { key = '' } = result.dataset
  if (key === sourceData.value.key || key === targetData.value?.key)
    return

  const data = dataKeyMap.value.get(key)
  if (data === undefined)
    return

  targetData.value = data

  let fromIndex: number | undefined
  let toIndex: number | undefined

  const { length } = shadowData.value
  for (let index = 0; index < length; index++) {
    const item = shadowData.value[index]
    if (fromIndex === undefined && sourceData.value.key === item.key)
      fromIndex = index
    else if (toIndex === undefined && data.key === item.key)
      toIndex = index
    if (fromIndex !== undefined && toIndex !== undefined)
      break
  }

  if (fromIndex === undefined || toIndex === undefined)
    return

  document.startViewTransition(() => {
    move(fromIndex, toIndex)
  })
}, computed(() => props.transitionDuration))

const { load, unload } = useStyleTag(computed(() => `
::view-transition-group(*) {
  animation-duration: ${props.transitionDuration}ms;
  animation-timing-function: ease;
}
::view-transition-
`), {
  immediate: false,
})

onActivated(load)
onDeactivated(unload)

const containerRef = ref<HTMLElement>() as Ref<HTMLElement>
</script>

<template>
  <div
    ref="containerRef"
    class="sortable-table"
    :class="{
      'is-dragging': isDragging,
    }"
    @dragend="handleDragEnd"
    @dragenter="handleDragEnter"
    @dragstart="handleDragStart"
  >
    <template
      v-for="(item, index) in shadowData"
      :key="item.key"
    >
      <div
        :data-key="item.key"
        :data-drag-id="DRAG_ID"
        :style="{
          'view-transition-name': `key-${item.key}`,
        }"
        draggable="true"
      >
        <slot
          name="default"
          :item="item._raw"
          :index="index"
          :is-grabbing="sourceData?.key === item.key"
          :is-dragging="isDragging"
        />
      </div>
    </template>
  </div>
</template>
