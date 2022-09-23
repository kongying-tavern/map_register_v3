<template>
  <q-btn
    class="table_action_btn"
    icon-right="add"
    label="新增用户"
    color="primary"
    outline
    @click="dialogVisible = true"
  />

  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="user_create" style="min-width: 30rem">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">新增用户</div>
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
          <q-input
            v-model="formData.username"
            for="username"
            autocomplete="off"
            :rules="[(val) => val.length >= 5 || '请至少输入5个字符']"
            label="用户名"
          ></q-input>
          <q-input
            v-model="formData.password"
            for="password"
            type="password"
            autocomplete="off"
            :rules="[(val) => val.length >= 6 || '密码最少6位']"
            label="密码"
          ></q-input>
          <q-input
            v-model="formData.passwordRepeat"
            :rules="[
              (value) => value === formData.password || '两次密码不一致',
            ]"
            lazy-rules
            type="password"
            autocomplete="off"
            label="再次输入密码"
          ></q-input>
        </q-form>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn label="取消" @click="dialogVisible = false" />
        <q-btn label="确认" color="primary" @click="onConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts" setup>
import { createUser, UserData } from '@/api/system/user'
import { useQuasar } from 'quasar'
import { ref } from 'vue'
const formData = ref({
  username: '',
  password: '',
  passwordRepeat: '',
})
const emit = defineEmits<{
  (e: 'refresh'): void
}>()
const dialogVisible = ref(false)
const $q = useQuasar()
const onConfirm = () => {
  const form = formData.value
  if (form.password === form.passwordRepeat) {
    createUser({ username: form.username, password: form.password })
      .then((res: any) => {
        if (res.code === 200) {
          $q.notify({ type: 'positive', message: '注册成功' })
          emit('refresh')
        }
      })
      .catch((err: any) => {
        console.log(err)
        $q.notify({ type: 'negative', message: JSON.stringify(err) })
      })
      .then(() => {
        dialogVisible.value = false
      })
  }
}

defineExpose<{
  formData: UserData
  dialogVisible: boolean
  onConfirm: void
}>()
</script>

<style lang="scss" scoped>
.table_action_btn {
  margin-right: 8px;
}
</style>
