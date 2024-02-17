<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash'
import type { TypeManager, TypeObject } from '../config'
import { TypeDetailForm } from '.'
import { useFetchHook } from '@/hooks'
import { GlobalDialogController } from '@/components'

const props = defineProps<{
  data: TypeObject
  parent?: TypeObject
  manager: TypeManager<TypeObject>
}>()

const emits = defineEmits<{
  success: []
}>()

const formRef = ref<InstanceType<typeof TypeDetailForm> | null>(null)

const form = ref(cloneDeep(props.data))

const { loading, refresh: submit, onSuccess, onError } = useFetchHook({
  onRequest: () => props.manager.update(form.value),
})

onSuccess(() => {
  ElMessage.success({
    message: `编辑${props.manager.info.label}成功`,
    offset: 48,
  })
  GlobalDialogController.close()
  emits('success')
})

onError(err => ElMessage.error({
  message: `编辑${props.manager.info.label}失败，原因为：${err.message}`,
  offset: 48,
}))

const editType = async () => {
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
      <el-button type="primary" :loading="loading" @click="editType">
        确认
      </el-button>

      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>
