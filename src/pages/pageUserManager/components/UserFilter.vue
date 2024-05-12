<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'

defineEmits<{
  change: []
}>()

const filterValue = defineModel<string>('modelValue', {
  required: true,
})

const filterKey = defineModel<string>('filterKey', {
  required: true,
})
</script>

<template>
  <div class="col-span-3 flex justify-end items-center p-2 border-b-[1px] border-[var(--el-border-color-lighter)]">
    <div class="flex gap-1">
      <el-select v-model="filterKey" style="width: 130px" @change="() => $emit('change')">
        <el-option label="昵称" value="nickname" />
        <el-option label="用户名" value="username" />
      </el-select>

      <el-input v-model="filterValue" placeholder="搜索..." clearable @change="() => $emit('change')">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <el-divider direction="vertical" />

    <slot name="footer" />
  </div>
</template>
