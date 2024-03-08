<script setup lang="ts">
const dialogRef = ref<HTMLDialogElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const dialog = dialogRef.value
  if (!dialog)
    return

  Reflect.set(window, 'dialog', dialog)
})

const onClick = (ev: MouseEvent) => {
  const clickOnContent = Boolean(ev.composedPath().find(ele => ele === contentRef.value))
  if (!clickOnContent)
    dialogRef.value?.close()
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="app-notice-provider"
    @click="onClick"
  >
    <div ref="contentRef" class="content">
      Notice
    </div>
  </dialog>
</template>

<style scoped>
.app-notice-provider {
  margin: auto;
  outline: none;
  background: transparent;
  &::backdrop {
    background-color: #000000A0;
  }
}

.content {
  border-radius: 8px;
  width: 600px;
  height: 400px;
  background: #FFF;
}
</style>
