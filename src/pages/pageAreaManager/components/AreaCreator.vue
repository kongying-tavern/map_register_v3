<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { AreaDetailForm } from '.'
import { GlobalDialogController, GlobalDrawerController, useFetchHook } from '@/hooks'
import Api from '@/api/api'

defineProps<{
  parent?: API.AreaVo
}>()

const emits = defineEmits<{
  success: []
}>()

const formData = ref<API.AreaVo>({})

const copyItems = shallowRef<API.ItemVo[]>([])

const { loading, refresh: submit, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    const { data: areaId } = await Api.area.createArea(formData.value)
    if (!areaId)
      throw new Error('无法确认新增地区的id')
    await Api.item.copyItemToArea({ areaId }, copyItems.value.map(item => item.id!))
  },
})

onSuccess(() => {
  ElMessage.success({
    message: '编辑地区信息成功',
    offset: 48,
  })
  GlobalDrawerController.close()
  emits('success')
})

onError(err => ElMessage.error({
  message: `编辑地区失败，原因为：${err.message}`,
  offset: 48,
}))

const formRef = ref<InstanceType<typeof AreaDetailForm> | null>(null)
const createArea = async () => {
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
  <div class="p-5">
    <AreaDetailForm ref="formRef" v-model="formData" v-model:items="copyItems" :parent="parent" />

    <div class="text-end pt-4">
      <el-button type="primary" :loading="loading" @click="createArea">
        确定
      </el-button>
      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>
