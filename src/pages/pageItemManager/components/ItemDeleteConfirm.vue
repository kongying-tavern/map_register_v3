<script setup lang="ts">
import { Check, Close, Delete } from '@element-plus/icons-vue'
import { useItemDelete } from '../hooks'
import {
  GlobalDialogController,
  WinDialog,
  WinDialogFooter,
  WinDialogTitleBar,
} from '@/components'

const props = defineProps<{
  item: API.ItemVo
}>()

const emits = defineEmits<{
  success: [API.ItemVo]
}>()

const { loading, deleteItem, onSuccess } = useItemDelete()

onSuccess(form => emits('success', form))

const cancel = () => {
  GlobalDialogController.close(false)
}

const confirm = async () => {
  await deleteItem(props.item)
  GlobalDialogController.close(true)
}
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="loading" @close="cancel">
      删除物品
    </WinDialogTitleBar>

    <div class="w-[300px] p-2 grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] gap-2">
      <div class=" row-span-2">
        <el-icon class="p-1" size="40" color="var(--el-color-danger)">
          <Delete />
        </el-icon>
      </div>
      <div>确实要永久性的删除此物品吗？</div>
      <div class="text-[var(--el-text-color-primary)]">
        <div>ID: {{ item.id }}</div>
        <div>名称: {{ item.name }}</div>
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
