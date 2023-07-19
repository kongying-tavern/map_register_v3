<script setup lang="ts">
defineProps<{
  userList: Record<number, API.SysUserSmallVo>
  userId: number
}>()
</script>
<template>
  <el-popover effect="light" trigger="hover" placement="top" width="auto">
    <template #default>
      <div>ID: {{ userId }}</div>
      <div v-if="userList[userId].qq">QQ: {{ userList[userId].qq }}</div>
      <div>用户名: {{ userList[userId].username }}</div>
      <div v-if="userList[userId].nickname">昵称: {{ userList[userId].nickname }}</div>
    </template>
    <template #reference>
      <el-tag>{{ userList[userId].nickname || userList[userId].username }}</el-tag>
    </template>
  </el-popover>
</template>