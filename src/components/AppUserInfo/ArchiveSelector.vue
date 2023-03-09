<script lang="ts" setup>
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { ArchiveCreator, ArchiveViewer } from '.'
import { useArchiveStore } from '@/stores'

const archiveStore = useArchiveStore()
archiveStore.fetchArchive()

const { archiveSlots } = storeToRefs(archiveStore)

const archiveCreateIndex = ref<number>()
const archiveViewIndex = ref<number>()

const timeFormater = (time?: string) => time
  ? dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  : ''
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="archiveStore.fetchLoading">
      正在加载存档...
    </div>

    <template v-else>
      <template v-for="(archiveSlot, index) of archiveSlots">
        <div
          v-if="archiveSlot"
          :key="archiveSlot.id"
          class="archive-item outline-card item-enter-anime"
          @click="archiveViewIndex = archiveSlot.slotIndex"
        >
          <div class="archive-banner items-center">
            存档状态或统计图
          </div>
          <div class="archive-name flex justify-between items-center gap-2">
            <div>{{ index }}. {{ archiveSlot.name }}</div>
            <div>更新时间 {{ timeFormater(archiveSlot.updateTime) }}</div>
          </div>
        </div>

        <div
          v-else
          :key="`empty-${Number(index)}`"
          class="archive-item outline-card item-enter-anime"
          @click="archiveCreateIndex = Number(index)"
        >
          <div class="archive-banner empty" />
          <div class="archive-name">
            {{ index }}. &lt;新建存档&gt;
          </div>
        </div>
      </template>
    </template>

    <ArchiveCreator v-model:slot-index="archiveCreateIndex" />
    <ArchiveViewer v-model:slot-index="archiveViewIndex" />
  </div>
</template>

<style lang="scss" scoped>
.outline-card {
  outline: 2px solid transparent;
  transition: all 100ms ease;
  border-radius: 6px;
}

// TODO 等待修复存档槽位 slot_index 问题
.disabled-slot {
  border: 2px dashed rgb(128 128 128 / 0.5);
  height: 96px;
  color: rgb(128 128 128);
}

@keyframes gs-slide-in {
  from { translate: -30px 0; opacity: 0; }
  to { translate: 0 0; opacity: 1; }
}

.item-enter-anime {
  opacity: 0;
  translate: -30px 0;
  animation: gs-slide-in 200ms ease forwards;
  @for $i from 1 through 5 {
    &:nth-of-type(#{$i}) {
      animation-delay: #{$i * 50}ms;
    }
  }
}

.archive-item {
  background: #E9E5DC;
  user-select: none;
  overflow: hidden;
  cursor: pointer;
  filter: drop-shadow(0 0 2px rgba(128 128 128 / 0.5));
  &:hover {
    scale: 1.02;
    outline-color: #FFF;
  }
  &:active {
    scale: 1;
  }
}

// 加号的剪切图案
@mixin clip-shape-plus() {
  clip-path: path('M 2 19 \
    L 19 19 \
    L 19 2 \
    Q 19 0 21 0 \
    L 29 0 \
    Q 31 0 31 2 \
    L 31 19 \
    L 48 19 \
    Q 50 19 50 21 \
    L 50 29 \
    Q 50 31 48 31 \
    L 31 31 \
    L 31 48 \
    Q 31 50 29 50 \
    L 21 50 \
    Q 19 50 19 48 \
    L 19 31 \
    L 2 31 \
    Q 0 31 0 29 \
    L 0 21 \
    Q 0 19 2 19 \
    Z \
  ');
}

.archive-banner {
  background: linear-gradient(to right, #D99242, #AD7E4D);
  padding: 0 6px;
  height: 60px;
  clip-path: inset(0 round 0 0 16px 0);
  &.empty {
    background: #7A7B7E;
    position: relative;
  }
  &.empty::before {
    scale: 0.8;
    content: '';
    width: 50px;
    height: 50px;
    background: #CCCCCD;
    position: absolute;
    left: calc(50% - 25px);
    top: 5px;
    @include clip-shape-plus();
  }
}

.archive-name {
  padding: 6px 16px;
  font-size: 16px;
}
</style>
