<script setup lang="ts">
import { ElDialog } from 'element-plus'
import { LoginPanel, RegisterPanel } from './components'

const visible = defineModel<boolean>('visible', {
  required: true,
})

const panelKey = ref('login')
</script>

<template>
  <ElDialog
    v-model="visible"
    destroy-on-close
    append-to-body
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="custom-dialog hidden-header"
    :style="{
      '--el-dialog-border-radius': '8px',
      '--el-dialog-padding-primary': '0',
      '--el-dialog-width': 'auto',
    }"
  >
    <RegisterPanel
      v-if="panelKey === 'register'"
      v-model:panel-key="panelKey"
      v-model:visible="visible"
    />
    <LoginPanel
      v-if="panelKey === 'login'"
      v-model:panel-key="panelKey"
      v-model:visible="visible"
    />
  </ElDialog>
</template>
