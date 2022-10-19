<script lang="ts" setup>
import { UserSortBtn } from '.'

interface SortOption {
  name: string
  field: string
}

const props = defineProps<{
  modelValue: string[]
  options: SortOption[]
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
}>()

const selectedMap = computed({
  get: () => props.options.reduce((seed) => {
    for (const v of props.modelValue)
      seed[v.slice(0, -1)] = v.slice(-1)
    return seed
  }, {} as Record<string, string>),
  set: (v) => {
    const list: string[] = []
    for (const key in v) {
      const schema = v[key]
      if (!schema || schema === 'none')
        continue
      list.push(`${key}${schema}`)
    }
    emits('update:modelValue', list)
  },
})
</script>

<template>
  <div class="flex items-center">
    <div class="text-sm w-10">
      排序
    </div>
    <UserSortBtn v-for="opt in props.options" :key="opt.field" v-model="selectedMap" :option="opt" />
  </div>
</template>
