<script setup lang="ts">
import ILoading from './components/ILoading.vue'

const props = defineProps<{
  data: Socket.DataEventRecord
  preData?: Socket.DataEventRecord
  isSelf?: boolean
}>()

const isDifferentUser = computed(() => !props.preData || props.preData.user.id !== props.data.user.id)

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
    class="p-2 flex gap-1 overflow-hidden"
    :class="{
      'flex-row-reverse': isSelf,
      'pt-0': !isDifferentUser,
    }"
  >
    <div class="w-8 h-8 shrink-0">
      <img v-if="isDifferentUser" class="rounded-[16px] bg-[var(--el-bg-color)]" :src="data.user.logo">
    </div>

    <div
      class="flex-1 text-xs flex flex-col gap-1 overflow-hidden"
      :class="isSelf ? 'items-end' : 'items-start'"
    >
      <div
        v-if="isDifferentUser"
        class="flex justify-end items-center gap-1"
        :class="isSelf ? 'flex-row-reverse' : ''"
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
          未支持的消息类型: {{ data.type }}
        </div>

        <Suspense v-else>
          <component :is="modules[data.type]" :data="data" :pre-data="preData" />
          <template #fallback>
            <ILoading />
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>
