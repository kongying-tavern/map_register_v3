<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { AreaDetailForm } from '.'
import { GlobalDialogController, useFetchHook } from '@/hooks'
import Api from '@/api/api'

const props = defineProps<{
  area: API.AreaVo
  parent?: API.AreaVo
}>()

const emits = defineEmits<{
  success: []
}>()

const formData = ref<API.AreaVo>(props.area)
const copyItems = shallowRef<API.ItemVo[]>([])

const { loading, refresh: submit, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    await Api.area.updateArea(formData.value)
    copyItems.value.length > 0 && await Api.item.copyItemToArea({ areaId: formData.value.id! }, copyItems.value.map(item => item.id!))
  },
})

onSuccess(() => {
  ElMessage.success({
    message: '编辑地区成功',
    offset: 48,
  })
  GlobalDialogController.close()
  emits('success')
})

onError(err => ElMessage.error({
  message: `编辑地区失败，原因为：${err.message}`,
  offset: 48,
}))

const formRef = ref<InstanceType<typeof AreaDetailForm> | null>(null)
const updateArea = async () => {
  try {
    await formRef.value?.validate()
    await submit()
  }
  catch {
    // validate, no error
  }
}
</script>

<template>
  <div class="p-3">
    <AreaDetailForm ref="formRef" v-model="formData" v-model:items="copyItems" :parent="parent" />

    <div class="text-end pt-4">
      <el-button :icon="Check" type="primary" :loading="loading" @click="updateArea">
        确定
      </el-button>
      <el-button :icon="Close" :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>
