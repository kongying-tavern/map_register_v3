<script setup lang="ts">
import dayjs from 'dayjs'
import ILoading from './components/ILoading.vue'

const props = defineProps<{
  data: Socket.DataEventRecord
  preData?: Socket.DataEventRecord
  isSelf?: boolean
}>()

const emits = defineEmits<{
  resolve: []
}>()

const isDifferentUser = computed(() => {
  const { id: currentUserId } = props.data.user
  return currentUserId !== props.preData?.user.id
})

const modules: {
  [K in keyof Socket.DataEventMap]?: Component
} = {
  MarkerAdded: defineAsyncComponent(() => import('./components/IMarkerAdd.vue')),
  MarkerUpdated: defineAsyncComponent(() => import('./components/IMarkerUpdate.vue')),
  MarkerDeleted: defineAsyncComponent(() => import('./components/IMarkerDelete.vue')),
}
</script>

<template>
  <div
    class="message-item"
    :class="{
      'is-different': isDifferentUser,
      'is-selfuser': isSelf,
    }"
  >
    <div class="w-8 shrink-0 overflow-hidden">
      <img class="w-8 h-8 object-cover rounded-[16px] bg-[var(--el-bg-color)]" :src="data.user.logo">
    </div>

    <div
      class="flex-1 text-xs flex flex-col gap-1 overflow-hidden"
      :class="isSelf ? 'items-end' : 'items-start'"
    >
      <div
        class="w-full flex justify-end items-center gap-1 overflow-hidden"
        :class="isSelf ? '' : 'flex-row-reverse'"
      >
        <div class="text-[var(--el-text-color-secondary)] whitespace-nowrap">
          {{ data.user.nickname }}
        </div>
      </div>

      <div
        class="bg-[var(--el-bg-color)] rounded-lg overflow-hidden"
        :class="isSelf ? 'ml-4' : 'mr-4'"
      >
        <div v-if="!modules[data.type]" class="p-2 text-[var(--el-text-color-secondary)]">
          <div>
            未支持的消息类型: {{ data.type }}
          </div>
          <el-divider style="margin: 4px 0" />
          <div>
            {{ dayjs(data.time).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </div>

        <Suspense v-else @resolve="() => emits('resolve')">
          <component :is="modules[data.type]" :data="data" :pre-data="preData" />
          <template #fallback>
            <ILoading />
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-item {
  --base-text-align: left;
  --base-flex-direction: row;

  margin: 8px 8px 16px;
  display: flex;
  gap: 4px;
  overflow: hidden;
  text-align: var(--base-text-align);
  flex-direction: var(--base-flex-direction);

  &.is-selfuser {
    --base-flex-direction: row-reverse;
    --base-text-align: right;
  }
}
</style>
