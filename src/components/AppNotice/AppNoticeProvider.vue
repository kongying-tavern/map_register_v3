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
  <dialog
    :ref="context.dialogRef"
    class="app-notice-provider genshin-text"
  >
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
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.app-notice-provider {
  --opacity: 0;
  --duration: .2s;

  display: block;
  margin: auto auto;
  border-radius: 4px;
  overflow: hidden;
  z-index: 10;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.4));
  background: transparent;
  outline: none;
  opacity: var(--opacity);
  transition: all var(--duration) cubic-bezier(0.18, 0.89, 0.32, 1.28);
  transform: scale(0.8);
  pointer-events: none;

  &[open] {
    --opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  &::backdrop {
    background-color: #00000040;
    animation: fade-in var(--duration) ease;
    transition: all ease .2s;
  }
}
</style>
