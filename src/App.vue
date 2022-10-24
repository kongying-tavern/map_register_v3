<script setup lang="ts">
import { AppDialogProvider } from '@/components'
</script>

<template>
  <router-view />

  <AppDialogProvider />
</template>
