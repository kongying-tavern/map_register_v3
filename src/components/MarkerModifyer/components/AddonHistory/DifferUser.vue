<script setup lang="ts">
withDefaults(defineProps<{
  updator?: API.SysUserSmallVo
  userId?: number
}>(), {
  updator: () => ({}),
})
</script>

<template>
  <div class="flex gap-2 text-xs">
    <el-avatar :size="32" shape="circle" :src="updator.logo" fit="cover">
      <el-icon :size="24">
        <Avatar />
      </el-icon>
    </el-avatar>
    <div class="flex flex-col">
      <div>UID: {{ userId }}</div>
      <div>{{ `${updator.nickname} (${updator.username})` }}</div>
    </div>
  </div>
</template>
