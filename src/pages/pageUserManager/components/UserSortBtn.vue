<script lang="ts" setup>
import { cloneDeep } from 'lodash'

interface SortOption {
  name: string
  field: string
}

const props = defineProps<{
  modelValue: Record<string, string>
  option: SortOption
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', v: Record<string, string>): void
}>()

const { state, next } = useCycleList(['+', '-', 'none'], {
  initialValue: props.modelValue[props.option.field] ?? 'none',
})

const btnType = computed(() => state.value === 'none' ? 'default' : 'primary')

const loopState = () => {
  const cloneMap = cloneDeep(props.modelValue)
  next()
  cloneMap[props.option.field] = state.value
  emits('update:modelValue', cloneMap)
}
</script>

<template>
  <el-button size="small" :type="btnType" @click="loopState">
    {{ `${props.option.name}${state === 'none' ? '' : state === '+' ? ' ↑' : ' ↓'}` }}
  </el-button>
</template>
