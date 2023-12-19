<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
}>()
const emit = defineEmits(['update:modelValue'])

const data = useVModel(props, 'modelValue', emit)

const shortcuts = [
  {
    text: '一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]
</script>

<template>
  <el-form>
    <div class="flex gap-x-8">
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="data"
          type="datetimerange"
          :shortcuts="shortcuts"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          format="YYYY-MM-DD hh:mm"
          value-format="YYYY-MM-DDThh:mm:ss.0000"
        />
      </el-form-item>

      <div label-width="0" class="ml-auto">
        <slot name="footer" />
      </div>
    </div>
  </el-form>
</template>

<style lang="scss" scoped>
.type-input {
  :deep(.el-input-group__prepend) {
    background-color: transparent;
  }
}
</style>
