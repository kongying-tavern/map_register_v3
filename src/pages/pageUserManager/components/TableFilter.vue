<script lang="ts" setup>
const props = defineProps<{
  modelValue: string
  filterKey: string
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:filterKey', v: string): void
}>()

const interValue = computed({
  get: () => props.modelValue,
  set: V => emits('update:modelValue', V),
})

const internalFilterKey = computed({
  get: () => props.filterKey,
  set: v => emits('update:filterKey', v),
})
</script>

<template>
  <div class="flex items-center w-80">
    <div class="text-sm w-10">
      搜索
    </div>
    <el-input v-model="interValue" class="table-filter" clearable>
      <template #prepend>
        <el-select v-model="internalFilterKey" class="w-20">
          <el-option label="昵称" value="nickname" />
          <el-option label="用户名" value="username" />
        </el-select>
      </template>
    </el-input>
  </div>
</template>

<style lang="scss" scoped>
.table-filter {
  :deep(.el-input-group__prepend) {
    background-color: transparent;
  }
}
</style>
