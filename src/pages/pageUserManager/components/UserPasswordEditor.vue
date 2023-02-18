<script setup lang="ts">
import { ref } from 'vue'
import type { FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { emptyCheck, lengthCheck } from '../utils/formRules'
import Api from '@/api/api'
import { messageFrom } from '@/utils'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'
import type { ElFormType } from '@/shared'

const props = defineProps<{
  user: API.SysUserVo
}>()

const emits = defineEmits<{
  (e: 'success'): void
}>()

const formData = ref({
  userId: props.user.id,
  oldPassword: '',
  password: '',
  repeatPassword: '',
})

const sameRules = [lengthCheck('密码', 6), emptyCheck()]

const rules: FormRules = {
  oldPassword: [...sameRules],
  password: [...sameRules],
  repeatPassword: [
    ...sameRules,
    {
      validator: () => {
        if (formData.value.repeatPassword !== formData.value.password)
          return new Error('两次输入的密码不一致')
        return true
      },
      trigger: 'blur',
    },
  ],
}

const formRef = ref<ElFormType | null>(null)
const loading = ref(false)

const onSubmit = async () => {
  try {
    const isValid = await formRef.value?.validate().catch(() => false)
    if (!isValid)
      return
    loading.value = true
    GlobalDialogController.updateBtnProps('submit', { props: { loading: loading.value } })
    const { repeatPassword, ...body } = formData.value
    const res = await Api.sysUserController.updateUserPassword({}, body)
    GlobalDialogController.close()
    ElMessage.success(res.message ?? '成功')
    emits('success')
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
  finally {
    loading.value = false
    GlobalDialogController.updateBtnProps('submit', { props: { loading: false } })
  }
}

GlobalDialogController.registerBtn('cancel', {
  text: '取消',
  onClick: () => GlobalDialogController.close(),
})
GlobalDialogController.registerBtn('submit', {
  props: { type: 'primary' },
  text: '确认',
  onClick: () => onSubmit(),
})
</script>

<template>
  <el-form ref="formRef" label-width="100px" class="p-4" :model="formData" :rules="rules">
    <el-form-item label="用户名">
      {{ props.user.username }}
    </el-form-item>
    <el-form-item prop="oldPassword" label="旧密码">
      <el-input v-model="formData.oldPassword" type="password" />
    </el-form-item>
    <el-form-item prop="password" label="新密码">
      <el-input v-model="formData.password" type="password" />
    </el-form-item>
    <el-form-item prop="repeatPassword" label="确认密码">
      <el-input v-model="formData.repeatPassword" type="password" />
    </el-form-item>
  </el-form>
</template>
