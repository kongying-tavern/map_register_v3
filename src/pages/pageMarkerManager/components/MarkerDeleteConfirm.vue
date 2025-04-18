<script setup lang="ts">
import {
  WinDialog,
  WinDialogFooter,
  WinDialogTitleBar,
} from '@/components'
import { Check, Close, Delete } from '@element-plus/icons-vue'
import { useMarkerDelete } from '../hooks'

const props = defineProps<{
  title: string
  marker: API.MarkerVo
}>()

const emits = defineEmits<{
  success: [API.MarkerVo]
  close: [boolean]
}>()

const { loading, deleteMarker, onSuccess } = useMarkerDelete()

onSuccess(form => emits('success', form))

const cancel = () => {
  emits('close', false)
}

const confirm = async () => {
  await deleteMarker(props.marker)
  emits('close', true)
}
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="loading" @close="cancel">
      {{ title }}
    </WinDialogTitleBar>

    <div class="w-[300px] p-2 grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] gap-2">
      <div class=" row-span-2">
        <el-icon class="p-1" size="40" color="var(--el-color-danger)">
          <Delete />
        </el-icon>
      </div>
      <div>确实要永久性的删除此点位吗？</div>
      <div class="text-[var(--el-text-color-primary)]">
        <div>名称: {{ marker.markerTitle }}</div>
        <div>ID: {{ marker.id }}</div>
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
