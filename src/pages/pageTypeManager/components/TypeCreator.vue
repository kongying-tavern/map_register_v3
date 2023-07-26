<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import type { TypeManager, TypeObject } from '../config'
import { TypeDetailForm } from '.'
import { GlobalDialogController, useFetchHook } from '@/hooks'

const props = defineProps<{
  parent?: TypeObject
  manager: TypeManager<TypeObject>
}>()

const emits = defineEmits<{
  success: []
}>()

const formRef = ref<InstanceType<typeof TypeDetailForm> | null>(null)

const form = ref<TypeObject>({
  parent: props.parent?.id,
})

const { loading, refresh: submit, onSuccess, onError } = useFetchHook({
  onRequest: () => props.manager.create(form.value),
})

onSuccess(() => {
  ElMessage.success({
    message: `添加${props.manager.info.label}成功`,
    offset: 48,
  })
  GlobalDialogController.close()
  emits('success')
})

onError(err => ElMessage.error({
  message: `添加${props.manager.info.label}失败，原因为：${err.message}`,
  offset: 48,
}))

const createType = async () => {
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
    <TypeDetailForm v-model="form" :parent="parent" :manager="manager" />

    <div class="text-end">
      <el-button type="primary" :loading="loading" @click="createType">
        确认
      </el-button>

      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>
