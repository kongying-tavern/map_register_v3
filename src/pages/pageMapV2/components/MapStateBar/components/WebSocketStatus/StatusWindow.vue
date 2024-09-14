<script setup lang="ts">
import MessageItem from './MessageItem.vue'
import { useSocketStore, useUserInfoStore } from '@/stores'

const socketStore = useSocketStore()
const userInfoStore = useUserInfoStore()
</script>

<template>
  <div class="w-full h-full overflow-hidden overflow-y-auto bg-[var(--el-fill-color)]">
    <MessageItem
      v-for="(message, index) in socketStore.messageList"
      :key="message.key"
      :data="message"
      :pre-data="socketStore.messageList[index - 1]"
      :is-self="message.user.id === userInfoStore.info.id"
    />
  </div>
</template>
