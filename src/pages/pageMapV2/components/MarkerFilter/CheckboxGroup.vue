<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
const props = defineProps<{
  modelValue?: any
  options: Record<string, unknown>[]
  labelKey: string
  valueKey: string
  /** 多选 */
  multiple?: boolean
  /** 两列 */
  twoCol?: boolean
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

const isActived = (targetOpt: Record<string, unknown>) => {
  return !props.multiple
    ? singleValue.value === targetOpt[props.valueKey]
    : multipleValue.value.findIndex(value => value === targetOpt[props.valueKey]) > -1
}

const patchValue = (patchOpt: Record<string, unknown>) => {
  // 单选
  if (!props.multiple) {
    singleValue.value = patchOpt[props.valueKey]
    emits('change', patchOpt[props.valueKey])
    return
  }

  // 多选
  const shallowCopyValue = [...multipleValue.value]
  const findIndex = shallowCopyValue.findIndex((value: unknown) => value === patchOpt[props.valueKey])
  if (findIndex > -1)
    shallowCopyValue.splice(findIndex, 1)
  else
    shallowCopyValue.push(patchOpt[props.valueKey])
  multipleValue.value = shallowCopyValue
  emits('change', shallowCopyValue)
}
</script>

<template>
  <el-scrollbar height="100%">
    <div
      v-bind="$attrs"
      class="checkbox-group genshin-text gap-0.5"
      :class="{
        'flex flex-col': !twoCol,
        'grid grid-cols-2': twoCol,
      }"
    >
      <div
        v-for="opt in options"
        :key="`${opt[valueKey]}`"
        :class="{ actived: isActived(opt) }"
        class="checkbox-item select-none"
        @click="() => patchValue(opt)"
      >
        {{ opt[labelKey] }}
      </div>
    </div>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.checkbox-group {
  overflow: auto;

  .checkbox-item {
    --scale: 0.98;
    --border-width: 1px;
    --outline-color: transparent;
    --color: #E4DDD1;
    --bg: transparent;

    padding: 12px 16px;
    position: relative;
    color: var(--color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

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
}
</style>
