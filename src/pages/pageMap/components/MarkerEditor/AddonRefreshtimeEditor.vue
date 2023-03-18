<script lang="ts" setup>
import { AppTimeSelect } from '@/components'

const props = defineProps<{
  modelValue?: number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: number): void
}>()

/**
 * {正数} 是毫秒
 * {0} 是不刷新
 * {-1} 是次日4点
 * {-2} 是点重置可以刷新的点位
 */
const internalBind = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})

const refreshtimeTypeOptions = [
  { label: '不刷新', value: 'none' },
  { label: '手动刷新', value: 'refreshable' },
  { label: '固定时长', value: 'timestamp' },
  { label: '次日4点', value: 'nextgameday' },
  { label: '次日0点', value: 'nextday' },
]

const refreshtimeType = computed({
  get: () => props.modelValue === undefined
    ? undefined
    : props.modelValue > 0
      ? 'timestamp'
      : ({
          0: 'none',
          [-1]: 'nextgameday',
          [-2]: 'refreshable',
          [-3]: 'nextday',
        })[props.modelValue],
  set: (v = '') => {
    internalBind.value = ({
      none: 0,
      nextgameday: -1,
      refreshable: -2,
      nextday: -3,
      timestamp: 12 * 3600 * 1000,
    } as Record<string, number>)[v]
  },
})
</script>

<template>
  <div class="w-full flex gap-2">
    <el-select-v2 v-model="refreshtimeType" :options="refreshtimeTypeOptions" style="width: 120px" />

    <template v-if="refreshtimeType === 'timestamp'">
      <AppTimeSelect v-model="internalBind" class="h-8 flex-1" />
    </template>
  </div>
</template>
