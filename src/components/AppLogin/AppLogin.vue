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
      '--el-dialog-width': '340px',
      '--el-dialog-bg-color': 'transparent',
    }"
  >
    <transition :name="panelKey === 'login' ? 'anime-left' : 'anime-right'" mode="out-in" appear>
      <component
        :is="panelKey === 'login' ? LoginPanel : RegisterPanel"
        v-model:panel-key="panelKey"
        v-model:visible="visible"
      />
    </transition>
  </ElDialog>
</template>

<style scoped>
.anime-left-enter-active,
.anime-left-leave-active {
  transition-property: opacity transform;
  transition-duration: 150ms;
  transition-timing-function: ease;
}
.anime-left-enter-from,
.anime-left-leave-to {
  opacity: 0;
  transform-origin: 50% 50%;
}
.anime-left-enter-from {
  transform: translate(-50%, 0);
}
.anime-left-leave-to {
  transform: translate(50%, 0);
}

.anime-right-enter-active,
.anime-right-leave-active {
  transition-property: opacity transform;
  transition-duration: 150ms;
  transition-timing-function: ease;
}
.anime-right-enter-from,
.anime-right-leave-to {
  opacity: 0;
  transform-origin: 50% 50%;
}
.anime-right-enter-from {
  transform: translate(50%, 0);
}
.anime-right-leave-to {
  transform: translate(-50%, 0);
}
</style>
