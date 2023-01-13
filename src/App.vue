<script setup lang="ts">
import { AppDialogProvider } from '@/components'
</script>

<template>
  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in" appear>
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </Transition>
  </router-view>

  <AppDialogProvider />
</template>
