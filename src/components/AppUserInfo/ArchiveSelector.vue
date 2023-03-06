<script lang="ts" setup>
import dayjs from 'dayjs'
import { ArchiveCreator } from '.'
import { useArchiveStore } from '@/stores'

const archiveStore = useArchiveStore()
archiveStore.fetchArchive()

const archiveCreatorVisible = ref(false)

const timeFormater = (time?: string) => time
  ? dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  : ''
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="archiveStore.fetchLoading">
      正在加载存档...
    </div>

    <div
      v-for="archive in archiveStore.archiveList"
      :key="archive.id"
      class="archive-item outline-card"
    >
      <div class="archive-banner items-center">
        存档状态或统计图
      </div>
      <div class="archive-name flex justify-between items-center gap-2">
        <div>{{ archive.id }}. {{ archive.name }}</div>
        <div>更新时间 {{ timeFormater(archive.updateTime) }}</div>
      </div>
    </div>

    <div
      v-if="!archiveStore.fetchLoading && archiveStore.archiveList.length < 5"
      class="archive-item outline-card"
      @click="archiveCreatorVisible = true"
    >
      <div class="archive-banner empty" />
      <div class="archive-name text-center">
        新建存档
      </div>
    </div>

    <ArchiveCreator v-model="archiveCreatorVisible" />
  </div>
</template>

<style lang="scss" scoped>
.outline-card {
  outline: 2px solid transparent;
  transition: all 100ms ease;
  border-radius: 6px;
  &:hover {
    scale: 1.02;
    outline-color: #FFF;
  }
  &:active {
    scale: 1;
  }
}

@keyframes gs-slide-in {
  from { translate: -50px 0; opacity: 0; }
  to { translate: 0 0; opacity: 1; }
}

.archive-item {
  background: #E9E5DC;
  user-select: none;
  overflow: hidden;
  cursor: pointer;
  filter: drop-shadow(0 0 2px rgba(128 128 128 / 0.5));
  animation: gs-slide-in 200ms ease forwards;
  translate: -30px 0;
  opacity: 0;
  @for $i from 1 through 5 {
    &:nth-of-type(#{$i}) {
      animation-delay: #{$i * 50}ms;
    }
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
