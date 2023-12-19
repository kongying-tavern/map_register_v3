<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { channelsDict } from '../const/dictionary'
import Api from '@/api/api'
import { GlobalDialogController, useFetchHook } from '@/hooks'
import type { ItemFormRules } from '@/utils'
import type { ElFormType } from '@/shared'

const emits = defineEmits<{
  success: []
}>()

const formData = ref<API.NoticeVo>({
  title: '',
})

const formRef = ref<ElFormType | null>(null)

const rules: ItemFormRules<API.NoticeVo & { validDateTime: [number, number] }> = {
  channel: [
    { required: true, message: '公告频道不能为空', trigger: 'change' },
  ],
  validDateTime: [
    {
      required: true,
      validator(rule, value, callback) {
        if (formData.value.validTimeStart && formData.value.validTimeEnd)
          callback()
        else
          callback('公告有效期不能为空')
      },
      trigger: 'change',
    },
  ],
  title: [
    { required: true, message: '公告标题不能为空', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '公告内容不能为空', trigger: 'blur' },
  ],
}

const validDateTime = ref()

const { loading, refresh: submit, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    await Api.notice.createNotice(formData.value)
  },
})

const createNotice = async () => {
  try {
    await formRef.value?.validate()
    await submit()
  }
  catch {
    // inValid form, no error
  }
}

onSuccess(() => {
  ElMessage.success({
    message: '新增公告成功',
    offset: 48,
  })
  GlobalDialogController.close()
  emits('success')
})

onError(err => ElMessage.error({
  message: `新增公告失败，原因为：${err.message}`,
  offset: 48,
}))

watch(validDateTime, (value) => {
  if (Array.isArray(value) && value.length === 2) {
    formData.value.validTimeStart = value[0]
    formData.value.validTimeEnd = value[1]
  }
  else {
    formData.value.validTimeStart = undefined
    formData.value.validTimeEnd = undefined
  }
})
</script>

<template>
  <div class="p-5">
    <el-form ref="formRef" v-bind="$attrs" label-width="100px" :model="formData" :rules="rules">
      <el-form-item label="频道" prop="channel">
        <el-select-v2 v-model="formData.channel" style="width: 100%" placeholder="请选择频道" :options="channelsDict" clearable />
      </el-form-item>
      <el-form-item label="有效期" prop="validDateTime">
        <el-date-picker
          v-model="validDateTime"
          style="width: 100%"
          type="datetimerange"
          clearable
          start-placeholder="发布时间"
          end-placeholder="截止时间"
          value-format="x"
        />
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" clearable />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input v-model="formData.content" placeholder="请输入内容" clearable type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <div class="pt-4 text-end">
      <el-button type="primary" :loading="loading" @click="createNotice">
        确认
      </el-button>
      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>
