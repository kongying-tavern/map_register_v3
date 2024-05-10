<script setup lang="ts">
import { context } from './context'
import { useNoticeList, useReadingRecord } from './hooks'
import { NoticeCard } from './components'

const { noticeList } = useNoticeList()

const { records, read } = useReadingRecord(context, noticeList)

const selectedIndex = ref(0)

const onTitleClick = (index: number, id: number) => {
  selectedIndex.value = index
  read(id)
}

const selectedNotice = computed(() => noticeList.value[selectedIndex.value])
</script>

<template>
  <dialog :ref="context.dialogRef" class="app-notice-provider genshin-text">
    <NoticeCard
      :context="context"
      :notice-list="noticeList"
      :selected-notice="selectedNotice"
      :selected-index="selectedIndex"
      :records="records"
      @title-click="onTitleClick"
    />
  </dialog>
</template>

<style scoped>
@property --dialog-backdrop-scale {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

.app-notice-provider {
  --opacity: 0;
  --duration: .2s;
  --dialog-body-scale: 0.8;
  --dialog-body-tr-timing: ease;
  --dialog-body-tr-duration: .2s;

  display: grid;
  place-items: center;
  align-content: center;
  place-content: center;
  width: 100dvw;
  max-width: 100dvw;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  z-index: 10000;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.4));
  background-color: transparent;
  outline: none;
  opacity: var(--opacity);
  pointer-events: none;
  transition: opacity ease .2s, background-color ease .2s;

  &[open] {
    --opacity: 1;
    --dialog-body-scale: 1;
    --dialog-body-tr-timing: cubic-bezier(0.18, 0.89, 0.32, 1.28);
    background-color: #00000040;
    pointer-events: auto;
  }

  &::backdrop {
    display: none;
  }
}
</style>
