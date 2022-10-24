<script lang="ts" setup>
import { useGlobalDialogContext } from '@/hooks/useGlobalDialog'

const { DialogController, dialogProps, is, visible } = useGlobalDialogContext()
</script>

<template>
  <el-dialog v-model="visible" v-bind="dialogProps">
    <component :is="is" :dialog-controller="DialogController" />
  </el-dialog>
</template>
