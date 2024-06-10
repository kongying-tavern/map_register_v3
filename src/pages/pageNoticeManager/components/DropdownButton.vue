<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'

defineProps<{
  isOpen?: boolean
  icon?: string | Component
}>()
</script>

<template>
  <el-button :type="isOpen ? 'primary' : 'default'" text :icon="icon">
    <slot name="default" />
    <el-icon class="el-icon--right transition-all" :class="isOpen ? 'rotate-180' : ''" :size="12">
      <ArrowDown />
    </el-icon>
  </el-button>
</template>
