<script setup lang="ts">
const props = defineProps<{
  users: Map<string, API.SysUserSmallVo>
  userId?: number
}>()

const info = computed(() => Object.assign({ id: props.userId }, props.users.get(`${props.userId}`)))
</script>

<template>
  <div class="flex gap-2 text-xs">
    <el-avatar :size="32" shape="circle" :src="info.logo" fit="cover">
      <el-icon :size="24">
        <Avatar />
      </el-icon>
    </el-avatar>
    <div class="flex flex-col">
      <div>UID: {{ info.id }}</div>
      <div>{{ `${info.nickname} (${info.username})` }}</div>
    </div>
  </div>
</template>
