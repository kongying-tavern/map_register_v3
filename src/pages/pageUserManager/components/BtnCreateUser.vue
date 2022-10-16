<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import System from '@/api/system'
import { messageFrom } from '@/utils'

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

const formData = ref({
  username: '',
  password: '',
  passwordRepeat: '',
})
const registrationType = ref({ label: '用户名', value: 'username' })
const dialogVisible = ref(false)

const onConfirm = async () => {
  const form = formData.value
  const { username, password, passwordRepeat } = formData.value
  if (password !== passwordRepeat)
    return

  try {
    if (registrationType.value.value === 'username') {
      const res = await System.sysUserController.registerUser({ username, password })
      ElMessage.success(res.message ?? '成功')
    }

    if (registrationType.value.value === 'qq') {
      const res = await System.sysUserController.registerUserByQQ({ username: form.username, password: form.password })
      ElMessage.success(res.message ?? '成功')
    }

    emits('refresh')
    dialogVisible.value = false
    formData.value = {
      username: '',
      password: '',
      passwordRepeat: '',
    }
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
}
</script>

<template>
  <el-button
    icon-right="add"
    label="新增用户"
    color="primary"
    style="margin-left: 8px"
    outline
    @click="dialogVisible = true"
  >
    <el-dialog v-model="dialogVisible">
      <el-card style="min-width: 30rem">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            新增用户
          </div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>
        <q-card-section>
          <q-form
            class="user_create_form"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          >
            <div class="user_create_type">
              <q-select
                v-model="registrationType"
                :options="[
                  { label: '用户名', value: 'username' },
                  { label: 'qq', value: 'qq' },
                ]"
              />
              <q-input
                v-model="formData.username"
                for="username"
                autocomplete="off"
                :rules="[(val) => val.length >= 5 || '请至少输入5个字符']"
                lazy-rules
              />
            </div>
            <q-input
              v-model="formData.password"
              for="password"
              type="password"
              autocomplete="off"
              :rules="[(val) => val.length >= 6 || '密码最少6位']"
              lazy-rules
              label="密码"
            />
            <q-input
              v-model="formData.passwordRepeat"
              :rules="[
                (value) => value === formData.password || '两次密码不一致',
              ]"
              lazy-rules
              type="password"
              autocomplete="off"
              label="再次输入密码"
            />
          </q-form>
        </q-card-section>
        <q-card-actions>
          <q-space />
          <q-btn label="取消" @click="dialogVisible = false" />
          <q-btn label="确认" color="primary" @click="onConfirm" />
        </q-card-actions>
      </el-card>
    </el-dialog>
  </el-button>
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
