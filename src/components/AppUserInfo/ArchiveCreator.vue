<script lang="ts" setup>
import { useFetchHook } from '@/hooks'
import { GSButton, GSInput } from '@/components'
import { useArchiveStore } from '@/stores'

const props = defineProps<{
  modelValue: boolean
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})

const archiveStore = useArchiveStore()

// ==================== 新增存档 ====================
const archiveName = ref('')
const errMsg = ref('')

const resetState = () => {
  archiveName.value = ''
  errMsg.value = ''
}

const { loading, refresh, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    errMsg.value = ''
    archiveName.value = archiveName.value.trim()
    if (archiveName.value.length < 1)
      throw new Error('存档名称长度不能小于 1 个字符')
    return await archiveStore.createArchive(archiveName.value)
  },
})

onSuccess(() => {
  visible.value = false
  archiveStore.fetchArchive()
})

onError((err) => {
  errMsg.value = err.message
})
</script>

<template>
  <el-dialog
    v-model="visible"
    append-to-body
    :show-close="false"
    align-center
    width="500px"
    class="custom-dialog hidden-header bg-transparent"
    @closed="resetState"
  >
    <div class="gs-dialog-content flex flex-col gap-4">
      <div class="genshin-text title text-center">
        新建存档
      </div>
      <div class="flex-1 flex flex-col mt-10 mb-10 gap-2">
        <GSInput v-model="archiveName" placeholder="请输入存档名称" />
        <div class="err-msg genshin-text text-base h-6">
          {{ errMsg }}
        </div>
      </div>
      <div class="flex justify-between gap-4">
        <GSButton icon="cancel" class="flex-1" @click="visible = false">
          取消
        </GSButton>
        <GSButton icon="submit" class="flex-1" :loading="loading" @click="refresh">
          确定
        </GSButton>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.gs-dialog-content {
  background: paint(dark-card-border);
  padding: 36px;
  .title {
    color: #D3BC8E;
    font-size: 30px;
  }
}

.err-msg {
  color: #CF5945;
}
</style>
