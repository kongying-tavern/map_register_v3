<script lang="ts" setup>
defineProps<{
  disabledMin?: boolean
  disabledMax?: boolean
  placeholderMin?: string
  placeholderMax?: string
}>()

const isValueNull = (value: unknown): boolean => {
  if (value === undefined || value === null || value?.toString() === '')
    return true
  else if (typeof value === 'string' && !Number.isFinite(value))
    return true

  return false
}
const valueSetter = (value: unknown) => isValueNull(value) ? null : value

const nativeInputMinRef = ref<HTMLInputElement>() as Ref<HTMLInputElement>
const nativeInputMaxRef = ref<HTMLInputElement>() as Ref<HTMLInputElement>

const modelValueMin = defineModel<number | null>('min', {
  required: false,
  default: null,
  set: valueSetter,
})
const modelValueMax = defineModel<number | null>('max', {
  required: false,
  default: null,
  set: valueSetter,
})
</script>

<template>
  <div
    class="condition-unit"
    :class="{ disabled: disabledMin && disabledMax }"
  >
    <div class="condition-unit-input__inner">
      <template v-if="$slots.prepend">
        <div class="condition-unit-input__separator condition-unit-input__prepend">
          <slot name="prepend" />
        </div>
      </template>
      <input
        ref="nativeInputMinRef"
        v-model.number="modelValueMin"
        class="condition-unit-input__internal"
        :placeholder="placeholderMin"
        :disabled="disabledMin"
      >
      <div class="condition-unit-input__sep">
        <slot name="separator">
          -
        </slot>
      </div>
      <input
        ref="nativeInputMaxRef"
        v-model.number="modelValueMax"
        class="condition-unit-input__internal"
        :placeholder="placeholderMax"
        :disabled="disabledMax"
      >
      <template v-if="$slots.append">
        <div class="condition-unit-input__separator condition-unit-input__append">
          <slot name="append" />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use './MarkerFilterInput.scss' as style;
@include style.main;
</style>
