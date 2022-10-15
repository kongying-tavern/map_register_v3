<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import System from '@/api/system'
import { messageFrom } from '@/utils'

const emit = defineEmits<{
  (e: 'refresh'): void
}>()
const formData = ref({
  username: '',
  password: '',
  passwordRepeat: '',
})
const registrationType = ref({ label: '用户名', value: 'username' })
const dialogVisible = ref(false)
const $q = useQuasar()
const onConfirm = () => {
  const form = formData.value
  if (form.password === form.passwordRepeat) {
    if (registrationType.value.value === 'username') {
      System.sysUserController
        .registerUser({ username: form.username, password: form.password })
        .then((res: any) => {
          if (res.code === 200)
            emit('refresh')
          $q.notify({
            type: res.code === 200 ? 'positive' : 'negative',
            message: res.message,
          })
        })
        .catch((err: any) => {
          // console.log(err)
          $q.notify({ type: 'negative', message: messageFrom(err) })
        })
        .then(() => {
          dialogVisible.value = false
          formData.value = {
            username: '',
            password: '',
            passwordRepeat: '',
          }
        })
    }

    if (registrationType.value.value === 'qq') {
      System.sysUserController
        .registerUserByQQ({ username: form.username, password: form.password })
        .then((res: any) => {
          if (res.code === 200)
            emit('refresh')
          $q.notify({
            type: res.code === 200 ? 'positive' : 'negative',
            message: res.message,
          })
        })
        .catch((err: any) => {
          // console.log(err)
          $q.notify({ type: 'negative', message: messageFrom(err) })
        })
        .then(() => {
          dialogVisible.value = false
          formData.value = {
            username: '',
            password: '',
            passwordRepeat: '',
          }
        })
    }
  }
}
</script>

<template>
  <q-btn
    icon-right="add"
    label="新增用户"
    color="primary"
    style="margin-left: 8px"
    outline
    @click="dialogVisible = true"
  />

  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="user_create" style="min-width: 30rem">
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
    </q-card>
  </q-dialog>
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
