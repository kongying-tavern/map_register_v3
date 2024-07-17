<script setup lang="ts">
import { Check, Close, Delete } from '@element-plus/icons-vue'
import { useTypeDelete } from '../hooks'
import type { TypeManager } from '../config'
import {
  GlobalDialogController,
  WinDialog,
  WinDialogFooter,
  WinDialogTitleBar,
} from '@/components'

const props = defineProps<{
  manager: TypeManager
  data: unknown
}>()

const emits = defineEmits<{
  success: []
}>()

const { loading, refresh: deleteType, onSuccess } = useTypeDelete(computed(() => props.manager))

onSuccess(() => emits('success'))

const cancel = () => {
  GlobalDialogController.close(false)
}

const confirm = async () => {
  await deleteType(props.data)
  GlobalDialogController.close(true)
}
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="loading" @close="cancel">
      删除 {{ manager.info.label }}
    </WinDialogTitleBar>

    <div class="w-[300px] p-2 grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] gap-2">
      <div class=" row-span-2">
        <el-icon class="p-1" size="40" color="var(--el-color-danger)">
          <Delete />
        </el-icon>
      </div>
      <div>确实要永久性的删除此项吗？</div>
      <div class="text-[var(--el-text-color-primary)]">
        <div>名称: {{ manager.getName(data) }}</div>
        <div>ID: {{ manager.getKey(data) }}</div>
      </div>
    </div>

    <WinDialogFooter>
      <el-button :icon="Check" :loading="loading" type="danger" @click="confirm">
        是
      </el-button>

      <el-button :icon="Close" :disabled="loading" @click="cancel">
        否
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
