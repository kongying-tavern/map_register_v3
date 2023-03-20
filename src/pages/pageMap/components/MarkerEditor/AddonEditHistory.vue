<script lang="ts" setup>
import { Clock } from '@element-plus/icons-vue'
import { TeleportExtra } from '.'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

const props = defineProps<{
  extraId: string
  markerVo: API.MarkerVo
}>()

const emits = defineEmits<{
  (e: 'update:extraId', v?: string): void
}>()

const extraActive = computed(() => props.extraId === 'history')
const toggleExtraPanel = () => {
  emits('update:extraId', extraActive.value ? '' : 'history')
}

const historyies = ref<API.HistoryVo[]>([])
const { onSuccess } = useFetchHook({
  immediate: true,
  onRequest: async () => {
    const { data: { record = [] } = {} } = await Api.history.getList({
      current: 1,
      size: 10,
      id: [props.markerVo.id as number],
      /** 记录类型 3-物品 4-点位 */
      type: 4,
    })
    return record
  },
})

onSuccess((data) => {
  historyies.value = data
})
</script>

<template>
  <el-button
    :icon="Clock"
    :type="extraActive ? 'primary' : 'default'"
    circle
    title="编辑历史"
    style="margin-left:0"
    @click="toggleExtraPanel"
  />

  <TeleportExtra :active="extraActive">
    <div class="h-full w-full flex flex-col">
      <div>点位编辑历史</div>
      <div class="flex-1 w-full overflow-hidden">
        <el-scrollbar height="100%">
          <div class="w-full h-full flex flex-col gap-2">
            <div v-for="history in historyies" :key="history.id" class="w-full h-32 border border-gray-300 rounded p-2">
              <el-scrollbar height="100%">
                <pre>{{ history.content }}</pre>
              </el-scrollbar>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </TeleportExtra>
</template>
