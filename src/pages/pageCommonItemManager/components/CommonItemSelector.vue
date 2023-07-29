<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { GlobalDialogController, useFetchHook } from '@/hooks'
import Api from '@/api/api'
import { AppItemSelecter } from '@/components'

const emits = defineEmits<{
  success: []
}>()

// ==================== 已选物品 ====================
const selectionItems = shallowRef<API.ItemVo[]>([])

// ==================== 添加至模板 ====================
const { loading: addLoading, refresh: addCommonItem, onSuccess: onCreateSuccess } = useFetchHook({
  onRequest: () => Api.itemCommon.addCommonItem(selectionItems.value.map(item => item.id!)),
})

onCreateSuccess(() => {
  ElMessage.success({
    message: '添加公共物品成功',
    offset: 48,
  })
  GlobalDialogController.close()
  emits('success')
})
</script>

<template>
  <AppItemSelecter v-model="selectionItems" title="添加至公共物品：" class="p-4">
    <template #append>
      <div class="text-end">
        <el-button type="primary" :disabled="!selectionItems.length" :loading="addLoading" @click="addCommonItem">
          确认
        </el-button>
        <el-button :disabled="addLoading" @click="GlobalDialogController.close">
          取消
        </el-button>
      </div>
    </template>
  </AppItemSelecter>
</template>
