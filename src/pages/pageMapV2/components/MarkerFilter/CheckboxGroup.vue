<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends Record<string, any>, R extends unknown = unknown">
import { Finished } from '@element-plus/icons-vue'

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
      <div
        v-if="multiple && showSelectAllBtn && options.length"
        :class="{ actived: isAllSelected }"
        class="checkbox-item"
        @click="toggleAllSelect"
      >
        <div class="checkbox-item__icon">
          <slot name="all-select-icon">
            <Finished />
          </slot>
        </div>
        <div class="checkbox-item__content">
          选择全部
        </div>
      </div>

      <div
        v-for="opt in options"
        :key="`${opt[valueKey]}`"
        :class="{ actived: isActived(opt) }"
        class="checkbox-item"
        @click="() => patchValue(opt)"
      >
        <div v-if="$slots.icon" class="checkbox-item__icon">
          <slot name="icon" :row="opt" :actived="isActived(opt)" :props="getComputed?.(opt)" />
        </div>
        <slot name="default" :row="opt" :actived="isActived(opt)" :props="getComputed?.(opt)">
          <div class="checkbox-item__content overflow-hidden overflow-ellipsis" :class="{ 'no-icon': !$slots.icon }" :title="opt[labelKey]">
            {{ opt[labelKey] }}
          </div>
        </slot>
      </div>
    </div>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.checkbox-group {
  --item-height: 48px;

  overflow: auto;
  display: grid;
  gap: 4px;

  .checkbox-item {
    --outline-color: #E3DDD180;
    --outline-width: 2px;
    --outline-offset: calc(0px - var(--outline-width));
    --color: #E4DDD1;
    --item-bg: transparent;
    --icon-bg: color-mix(in srgb, #FFF 20%, #263240);

    height: var(--item-height);
    margin: 2px;
    display: flex;
    align-items: center;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color);
    background-color: var(--item-bg);
    outline-offset: var(--outline-offset);
    outline: var(--outline-width) solid var(--outline-color);
    transition: all ease 150ms, outline-offset linear 50ms;
    border-radius: 6px;
    user-select: none;

    &:hover {
      --outline-color: #F3EEE6;
      outline-offset: 0px;
    }
    &:active {
      outline-offset: var(--outline-offset);
    }
    &.actived {
      --color: #263240;
      --item-bg: #E4DDD1;
      --icon-bg: color-mix(in srgb, #FFF 60%, #263240);
    }
  }

  .checkbox-item__icon {
    height: 100%;
    aspect-ratio: 1 / 1;
    padding: 8px;
    display: grid;
    background-color: var(--icon-bg);
    place-items: center;
    transition: all ease 150ms;
  }

  .checkbox-item__content {
    flex: 1;
    padding: 8px;
    &.no-icon {
      padding: 8px 16px;
    }
  }
}
</style>
