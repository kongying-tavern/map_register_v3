<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { GSButton, GSInput } from '@/components'

const useArchive = () => {
  const archiveList = ref<API.ArchiveVo[]>([])

  const { onSuccess: onArchiveListFetched, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => Api.archive.getAllArchive({}),
  })
  onArchiveListFetched(({ data = [] }) => {
    archiveList.value = data
  })

  return { archiveList, onArchiveListFetched, ...rest }
}

const { archiveList, loading } = useArchive()

const visible = ref(false)

const debugInfo = () => ElMessage.warning('开发中')
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="loading">
      正在加载存档...
    </div>

    <div
      v-for="archive in archiveList"
      :key="archive.id"
      class="archive-item outline-card"
    >
      <div class="archive-banner items-center">
        存档状态或统计图
      </div>
      <div class="archive-name flex items-center gap-2">
        {{ archive.id }}: {{ archive.name }}
      </div>
    </div>

    <div v-if="!loading && archiveList.length < 5" class="archive-item outline-card" @click="visible = true">
      <div class="archive-banner empty" />
      <div class="archive-name text-center">
        新建存档
      </div>
    </div>
  </div>

  <el-dialog
    v-model="visible"
    append-to-body
    :show-close="false"
    align-center
    width="500px"
    class="custom-dialog hidden-header bg-transparent"
  >
    <div class="gs-dialog-content flex flex-col gap-4">
      <div class="genshin-text title text-center">
        新建存档
      </div>
      <GSInput class="flex-1 mt-10 mb-10" />
      <div class="flex justify-between gap-4">
        <GSButton icon="cancel" class="flex-1" @click="debugInfo">
          取消
        </GSButton>
        <GSButton icon="submit" class="flex-1" @click="debugInfo">
          确定
        </GSButton>
      </div>
    </div>
  </el-dialog>
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

.archive-banner {
  background: linear-gradient(to right, #D99242, #AD7E4D);
  padding: 0 6px;
  height: 60px;
  clip-path: inset(0 round 0 0 16px 0);
  &.empty {
    background: #7A7B7E;
    position: relative;
    &::before {
      scale: 0.8;
      content: '';
      width: 50px;
      height: 50px;
      background: #CCCCCD;
      position: absolute;
      left: calc(50% - 25px);
      top: 5px;
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
        Z');
    }
  }
}

.archive-name {
  padding: 6px 16px;
  font-size: 16px;
}

.archive-create {
  border: 2px dashed gray;
  display: grid;
  place-items: center;
  padding: 33px 0;
  font-size: 18px;
  user-select: none;
  cursor: pointer;
}

.gs-dialog-content {
  background: #3E4556;
  border-radius: 24px;
  padding: 24px;
  .title {
    color: #D3BC8E;
    font-size: 30px;
  }
}
</style>
