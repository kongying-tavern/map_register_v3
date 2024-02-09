<script lang="ts" setup generic="T extends Record<string, any>, LK extends keyof T, V extends T[LK], VV extends V[]">
const props = defineProps<{
  list: T[]
  valueKey: LK
  multiple?: boolean
}>()

const emits = defineEmits<{
  change: [v?: V]
  multipleChange: [v: VV]
}>()

/** 单选值 */
const modelValue = defineModel<V | null>('modelValue', {
  required: false,
  default: null,
})

/** 多选值 */
const modelMultipleValue = defineModel<VV>('modelMultipleValue', {
  required: false,
  default: [],
})

const isActived = (targetOpt: T) => !props.multiple
  ? modelValue.value === targetOpt[props.valueKey]
  : modelMultipleValue.value.findIndex(value => value === targetOpt[props.valueKey]) > -1

const patchValue = (patchOpt: T) => {
  // 单选
  if (!props.multiple) {
    modelValue.value = patchOpt[props.valueKey] !== modelValue.value ? patchOpt[props.valueKey] : null
    emits('change', patchOpt[props.valueKey] as V)
  }
  // 多选
  else {
    const shallowCopyValue = [...modelMultipleValue.value]
    const findIndex = shallowCopyValue.findIndex(value => value === patchOpt[props.valueKey])
    if (findIndex > -1)
      shallowCopyValue.splice(findIndex, 1)
    else
      shallowCopyValue.push(patchOpt[props.valueKey])
    modelMultipleValue.value = shallowCopyValue as VV
    emits('multipleChange', shallowCopyValue as VV)
  }
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div
      v-for="item in list"
      :key="`${item[valueKey as keyof T]}`"
      class="condition-row"
      :class="{
        actived: isActived(item),
      }"
      @click="() => patchValue(item)"
    >
      <slot name="icon" :item="item" />
      <slot :item="item" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.condition-row {
  padding: 16px;
  background: #202D3F;
  outline: 2px solid #363F4A;
  outline-offset: -4px;
  display: flex;
  border-radius: 8px;
  transition: all linear 50ms;
  user-select: none;
  font-size: 16px;
  cursor: pointer;

  &:not(.actived):hover {
    outline-color: #FFF;
    outline-offset: -2px;
  }

  &:not(.actived):active {
    outline-offset: -4px;
  }

  &.actived {
    background: #F3E2BF;
    color: #202D3F;
  }
}
</style>
