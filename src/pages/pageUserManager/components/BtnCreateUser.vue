<script lang="ts" setup>
import { ref } from 'vue'
import type { FormRules } from 'element-plus'
import { ElForm, ElMessage } from 'element-plus'
import { emptyCheck, lengthCheck } from '../utils/formRules'
import System from '@/api/system'
import { messageFrom } from '@/utils'

const emits = defineEmits<{
  (e: 'success'): void
}>()

const formData = ref({
  username: '',
  password: '',
  passwordRepeat: '',
})
const registrationType = ref('username')
const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const closeDialog = () => {
  if (loading.value)
    return
  dialogVisible.value = false
}

const beforeClose = (done: () => void) => {
  if (loading.value)
    return
  done()
}

const rules: FormRules = {
  username: [lengthCheck('用户名', 6), emptyCheck()],
  password: [lengthCheck('密码', 6), emptyCheck()],
  passwordRepeat: [
    lengthCheck('密码', 6),
    emptyCheck(),
    {
      validator: () => {
        if (formData.value.passwordRepeat !== formData.value.password)
          return new Error('两次输入的密码不一致')
        return true
      },
      trigger: 'blur',
    },
  ],
}

const resetFormState = () => {
  formData.value = {
    username: '',
    password: '',
    passwordRepeat: '',
  }
  registrationType.value = 'username'
  formRef.value?.resetFields()
}

const onConfirm = async () => {
  try {
    await formRef.value?.validate().catch((err) => {
      throw new Error(`字段 [${Object.keys(err).join(', ')}] 未通过校验`)
    })
    const { username, password } = formData.value
    loading.value = true
    const res = await System.sysUserController[
      registrationType.value === 'username'
        ? 'registerUser'
        : 'registerUserByQQ'
    ]({ username, password })
    ElMessage.success(res.message ?? '注册成功')
    dialogVisible.value = false
    resetFormState()
    emits('success')
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-end" v-bind="$attrs">
    <el-button type="primary" @click="dialogVisible = true">
      新增用户
    </el-button>

    <el-dialog v-model="dialogVisible" title="新增用户" width="320px" :before-close="beforeClose" @closed="resetFormState">
      <ElForm ref="formRef" :model="formData" :rules="rules">
        <el-form-item prop="username">
          <el-input v-model="formData.username">
            <template #prepend>
              <el-select v-model="registrationType" class="w-24">
                <el-option label="用户名" value="username" />
                <el-option label="QQ" value="qq" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" label-width="96px" prop="password">
          <el-input v-model="formData.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" label-width="96px" prop="passwordRepeat">
          <el-input v-model="formData.passwordRepeat" type="password" show-password />
        </el-form-item>
      </ElForm>

      <template #footer>
        <el-button @click="closeDialog">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="onConfirm">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user_create_type {
  display: flex;
  .q-select.q-field {
    min-width: 84px;
  }
  .q-input.q-field {
    flex: 1;
  }
}
</style>
