<script lang="ts" setup>
import { CaretBottom, CaretTop, DeleteFilled } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { GSButton, GSCard } from '@/components'
import type { ArchiveSlotData } from '@/stores'
import { useArchiveStore } from '@/stores'
import { useFetchHook } from '@/hooks'

const props = defineProps<{
  slotIndex?: number
}>()
const emits = defineEmits<{
  (e: 'update:slotIndex', v?: number): void
}>()

const index = computed({
  get: () => props.slotIndex,
  set: v => emits('update:slotIndex', v),
})

const archiveStore = useArchiveStore()

const archiveSlot = ref<ArchiveSlotData>()
const initDialog = () => {
  if (index.value === undefined)
    return
  archiveSlot.value = archiveStore.archiveSlots[index.value]
}

// ==================== 底部信息栏 ====================
const stopSignal = ref(false)
const message = refAutoReset('', 3000)
const virtualRef = ref<HTMLElement>()
const note = (ev: Event, msg: string) => {
  if (stopSignal.value) {
    stopSignal.value = false
    return
  }
  virtualRef.value = (ev.target as HTMLElement)
  message.value = msg
}

const onDialogClosed = () => {
  index.value = undefined
  stopSignal.value = false
  archiveSlot.value = undefined
}

// ==================== 存档逻辑 ====================
const { loading, refresh: saveArchive, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    await archiveStore.saveArchiveToSlot(index.value)
    await archiveStore.fetchArchive()
  },
})
onSuccess(async () => {
  index.value = undefined
})
onError((err) => {
  ElNotification.error({
    message: err.message,
  })
})

const loadArchive = () => {
  archiveStore.loadArchiveSlot(index.value)
  index.value = undefined
}

/** 按住 3 秒以确认删除存档 */
const onAnimationEnd = (ev: AnimationEvent) => {
  if (ev.animationName !== 'anime-delete-archive')
    return
  archiveStore.deleteArchiveSlot(index.value)
  stopSignal.value = true
  index.value = undefined
}
</script>

<template>
  <el-dialog
    :model-value="Number.isInteger(index)"
    :show-close="false"
    :close-on-click-modal="!loading"
    append-to-body
    align-center
    width="500px"
    class="custom-dialog hidden-header bg-transparent"
    @open="initDialog"
    @closed="onDialogClosed"
  >
    <GSCard v-if="!archiveSlot" title="存档为空" />
    <GSCard v-else :title="`存档: ${archiveSlot.name}`" class="gap-4">
      <div class="flex flex-col">
        <div v-for="(history, historyIndex) in archiveSlot.archiveList" :key="history.timestamp">
          <div>【历史记录 {{ historyIndex + 1 }}】{{ dayjs(history.timestamp).format('YYYY-MM-DD HH:mm:ss') }}（标记点位数：{{ history.body.Data_KYJG.size }}）</div>
        </div>
      </div>

      <div class="flex justify-between gap-4">
        <GSButton class="flex-1" :loading="loading" @click="saveArchive">
          <template #icon>
            <el-icon color="#FFCC33">
              <CaretTop />
            </el-icon>
          </template>
          保存到该存档
        </GSButton>

        <GSButton
          class="hold-and-delete"
          :disabled="loading"
          @click="(e) => note(e, '持续按住删除按钮以确认删除')"
          @animationend="onAnimationEnd"
        >
          <template #icon>
            <el-icon :size="16" color="#CF5945">
              <DeleteFilled />
            </el-icon>
          </template>
        </GSButton>

        <GSButton class="flex-1" :disabled="loading" @click="loadArchive">
          <template #icon>
            <el-icon color="#FFCC33">
              <CaretBottom />
            </el-icon>
          </template>
          读取该存档
        </GSButton>
      </div>

      <el-tooltip
        :visible="Boolean(message)"
        :content="message"
        :virtual-ref="virtualRef"
        placement="bottom"
        virtual-triggering
      />
    </GSCard>
  </el-dialog>
</template>

<style lang="scss" setup>
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes anime-delete-archive {
  10% { --angle: 0deg; }
  100% { --angle: 360deg; }
}

.hold-and-delete:active::before {
  content: '';
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  scale: 1.8;
  position: absolute;
  border-radius: 100%;
  background: conic-gradient(#FFCC33 var(--angle), transparent var(--angle));
  mask: radial-gradient(transparent 49%, #000 50%);
  animation: anime-delete-archive 3s linear forwards;
}
</style>
