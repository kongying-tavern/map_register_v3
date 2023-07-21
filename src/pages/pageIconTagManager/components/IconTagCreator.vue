<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { IconTagDetailForm } from '.'
import { GlobalDialogController, useFetchHook } from '@/hooks'
import Api from '@/api/api'

const emits = defineEmits<{
  success: []
}>()

const formData = ref({
  tag: '',
  iconId: undefined as number | undefined,
})

const { loading, refresh: submit, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    const { tag: tagName, iconId } = formData.value
    await Api.tag.createTag({ tagName })
    await Api.tag.updateTag({ tagName, iconId: iconId! })
  },
})

onSuccess(() => {
  ElMessage.success({
    message: '添加成功',
    offset: 48,
  })
  GlobalDialogController.close()
  emits('success')
})

onError(err => ElMessage.error({
  message: `添加标签失败，原因为：${err.message}`,
  offset: 48,
}))

const formRef = shallowRef<InstanceType<typeof IconTagDetailForm> | null>(null)
const test = async () => {
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
    <IconTagDetailForm ref="formRef" v-model="formData" />

    <div class="w-full flex justify-end pt-2">
      <el-button type="primary" :loading="loading" @click="test">
        确认
      </el-button>
      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>
