<script setup lang="ts">
import MessageItem from './MessageItem.vue'
import { useSocketStore, useUserInfoStore } from '@/stores'

const socketStore = useSocketStore()
const userInfoStore = useUserInfoStore()
</script>

<template>
  <div class="w-full h-full overflow-hidden overflow-y-auto bg-[var(--el-fill-color)]">
    <MessageItem
      v-for="i in socketStore.messageList"
      :key="i.key"
      :data="i"
      :is-self="i.user.id === userInfoStore.info.id"
    />
  </div>
</template>
