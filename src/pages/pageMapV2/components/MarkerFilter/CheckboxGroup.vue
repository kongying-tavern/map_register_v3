<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends Record<string, any>, R extends unknown = unknown">
import { Finished } from '@element-plus/icons-vue'
import { CheckboxItem } from '.'

const props = defineProps<{
  modelValue?: any
  options: T[]
  labelKey: string
  valueKey: string
  /** 多选 */
  multiple?: boolean
  /** 两列 */
  twoCol?: boolean
  /** 是否显示全选按钮，仅在 multiple 模式下生效 */
  showSelectAllBtn?: boolean
  /** 需要通过列表项值来计算的属性 */
  getComputed?: (row: T) => R
  /** 拖拽控制 key */
  draggable?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: any): void
  (e: 'change', v?: any): void
}>()

const isArrayValue = computed(() => Array.isArray(props.modelValue))

/** 多选值 */
const multipleValue = computed<any[]>({
  get: () => isArrayValue.value ? props.modelValue : [],
  set: v => emits('update:modelValue', v),
})

/** 单选值 */
const singleValue = computed({
  get: () => isArrayValue.value ? undefined : props.modelValue,
  set: v => emits('update:modelValue', v),
})

const isActived = (targetOpt: T) => {
  return !props.multiple
    ? singleValue.value === targetOpt[props.valueKey]
    : multipleValue.value.findIndex(value => value === targetOpt[props.valueKey]) > -1
}

const patchArrayValue = (values: any[]) => {
  multipleValue.value = values
  emits('change', values)
}

const patchValue = (patchOpt: T) => {
  // 单选
  if (!props.multiple) {
    singleValue.value = patchOpt[props.valueKey]
    emits('change', patchOpt[props.valueKey])
    return
  }

  // 多选
  const shallowCopyValue = [...multipleValue.value]
  const findIndex = shallowCopyValue.findIndex((value: any) => value === patchOpt[props.valueKey])
  if (findIndex > -1)
    shallowCopyValue.splice(findIndex, 1)
  else
    shallowCopyValue.push(patchOpt[props.valueKey])
  patchArrayValue(shallowCopyValue)
}

const isAllSelected = computed(() => {
  const set = new Set(multipleValue.value)
  for (const item of props.options) {
    if (!set.has(item[props.valueKey]))
      return false
  }
  return true
})
const toggleAllSelect = () => {
  if (!props.multiple)
    return
  patchArrayValue(isAllSelected.value ? [] : props.options.map(item => item[props.valueKey]))
}

// ==================== 拖拽控制 ====================
const handleDragStart = (ev: DragEvent, row: T) => {
  if (!props.draggable || !ev.dataTransfer)
    return
  ev.dataTransfer.setData('text', JSON.stringify(row))
}
</script>

<template>
  <el-scrollbar height="100%">
    <div
      v-bind="$attrs"
      class="checkbox-group genshin-text"
      :class="{
        'grid-cols-1': !twoCol,
        'grid-cols-2': twoCol,
      }"
    >
      <CheckboxItem
        v-if="multiple && showSelectAllBtn && options.length"
        label="选择全部"
        :is-actived="isAllSelected"
        @click="toggleAllSelect"
      >
        <template #icon>
          <slot name="all-select-icon">
            <Finished />
          </slot>
        </template>
      </CheckboxItem>

      <CheckboxItem
        v-for="opt in options"
        :key="`${opt[valueKey]}`"
        :label="opt[labelKey]"
        :props="getComputed?.(opt)"
        :is-actived="isActived(opt)"
        :draggable="draggable"
        @dragstart="(ev: DragEvent) => handleDragStart(ev, opt)"
        @click="() => patchValue(opt)"
      >
        <template v-if="$slots.icon" #icon>
          <slot name="icon" :row="opt" :actived="isActived(opt)" :props="getComputed?.(opt)" />
        </template>

        <template v-if="$slots.default" #default>
          <slot name="default" :row="opt" :actived="isActived(opt)" :props="getComputed?.(opt)" />
        </template>
      </CheckboxItem>
    </div>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.checkbox-group {
  overflow: auto;
  display: grid;
  gap: 4px;
}
</style>
