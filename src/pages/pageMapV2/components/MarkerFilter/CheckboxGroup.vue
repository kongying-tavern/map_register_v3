<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { Finished } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue?: any
  options: Record<string, any>[]
  labelKey: string
  valueKey: string
  /** 多选 */
  multiple?: boolean
  /** 两列 */
  twoCol?: boolean
  /** 是否显示全选按钮，仅在 multiple 模式下生效 */
  showSelectAllBtn?: boolean
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

const isActived = (targetOpt: Record<string, any>) => {
  return !props.multiple
    ? singleValue.value === targetOpt[props.valueKey]
    : multipleValue.value.findIndex(value => value === targetOpt[props.valueKey]) > -1
}

const patchArrayValue = (values: any[]) => {
  multipleValue.value = values
  emits('change', values)
}

const patchValue = (patchOpt: Record<string, any>) => {
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
      class="checkbox-group genshin-text grid gap-0.5"
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
          <slot name="icon" :row="opt" :actived="isActived(opt)" />
        </div>
        <div class="checkbox-item__content overflow-hidden overflow-ellipsis" :class="{ 'no-icon': !$slots.icon }" :title="opt[labelKey]">
          {{ opt[labelKey] }}
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.checkbox-group {
  --item-height: 48px;

  overflow: auto;

  .checkbox-item {
    --scale: 0.98;
    --border-width: 1px;
    --outline-color: transparent;
    --color: #E4DDD1;
    --bg: transparent;

    height: var(--item-height);
    display: flex;
    align-items: center;
    position: relative;
    color: var(--color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;

    &:hover {
      --scale: 1;
      --outline-color: #F3EEE6;
    }
    &:active {
      --scale: 0.98;
      --outline-color: transparent;
    }
    &.actived {
      --color: #263240;
      --bg: #E4DDD1;
    }

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      border: 2px solid var(--outline-color);
      scale: var(--scale);
      transition: all ease 150ms;
      z-index: -1;
    }
    &::after {
      content: '';
      position: absolute;
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      left: 2px;
      top: 2px;
      background: var(--bg);
      border: var(--border-width) solid #E3DDD180;
      scale: var(--scale);
      transition: all ease 150ms;
      z-index: -1;
    }
  }

  .checkbox-item__icon {
    height: var(--item-height);
    width: var(--item-height);
    padding: 8px;
  }

  .checkbox-item__content {
    flex: 1;
    padding: 8px 4px 8px 0;
    &.no-icon {
      padding: 8px 16px;
    }
  }
}
</style>
