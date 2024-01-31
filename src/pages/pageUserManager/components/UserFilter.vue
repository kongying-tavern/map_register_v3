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
  <el-form>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
      <el-form-item label-width="0">
        <div class="w-full flex gap-1">
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
      </el-form-item>

      <el-form-item />

      <el-form-item />

      <el-form-item label-width="0">
        <slot name="footer" />
      </el-form-item>
    </div>
  </el-form>
</template>
