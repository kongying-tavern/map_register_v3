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
  <el-form>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 place-items-end">
      <el-form-item label="搜索">
        <el-input v-model="interValue" class="type-input" clearable>
          <template #prepend>
            <el-select v-model="internalFilterKey" class="w-24">
              <el-option label="昵称" value="nickname" />
              <el-option label="用户名" value="username" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item />

      <el-form-item />

      <el-form-item label-width="0">
        <slot name="footer" />
      </el-form-item>
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
