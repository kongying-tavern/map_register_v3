<script setup lang="ts">
import { now } from '@/shared'

defineEmits<{
  change: []
}>()

const modelValue = defineModel<number[]>('modelValue', {
  required: true,
})

const shortcuts = [
  {
    text: '近 7 天',
    value: () => {
      const now = new Date()
      const start = new Date(now.getTime() - 7 * 86400_000)
      return [start, now]
    },
  },
  {
    text: '近 30 天',
    value: () => {
      const now = new Date()
      const start = new Date(now.getTime() - 30 * 86400_000)
      return [start, now]
    },
  },
  {
    text: '近 90 天',
    value: () => {
      const now = new Date()
      const start = new Date(now.getTime() - 90 * 86400_000)
      return [start, now]
    },
  },
  {
    text: '近 180 天',
    value: () => {
      const now = new Date()
      const start = new Date(now.getTime() - 180 * 86400_000)
      return [start, now]
    },
  },
]

const getDisabledData = (date: Date) => {
  return date.getTime() > now.value
}
</script>

<template>
  <div class="p-2 flex justify-end border-b-[1px] border-[var(--el-border-color-lighter)]">
    <div>
      <el-date-picker
        v-model="modelValue"
        type="datetimerange"
        range-separator="To"
        start-placeholder="Start date"
        end-placeholder="End date"
        format="YYYY-MM-DD hh:mm"
        value-format="x"
        :clearable="false"
        :shortcuts="shortcuts"
        :disabled-date="getDisabledData"
        @change="() => $emit('change')"
      />
    </div>
  </div>
</template>
