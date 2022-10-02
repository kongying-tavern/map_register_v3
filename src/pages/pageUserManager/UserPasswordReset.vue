<template>
  <q-btn
    dense
    flat
    color="primary"
    style="margin-right: 8px"
    @click="dialogVisible = true"
    >修改密码</q-btn
  >
  <q-dialog :model-value="dialogVisible" persistent>
    <q-card class="user_edit">
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">修改密码</div>
          <q-space />
          <q-btn
            v-close-popup
            icon="close"
            flat
            round
            dense
            @click="dialogVisible = false"
          />
        </q-card-section>
        <q-card-section>
          ID: {{ user.id }} <br />
          {{ user.username && '用户名: ' + user.username }} <br />
          {{ user.nickname && '昵称: ' + user.nickname }}
          <q-input
            v-model="formData.oldPassword"
            type="password"
            name="password"
            autocomplete="off"
            label="原密码"
          />
          <q-input
            v-model="formData.password"
            :rules="[(val) => val.length >= 6 || '密码最少6位']"
            type="password"
            name="password-new"
            autocomplete="off"
            label="新密码"
          />
          <q-input
            v-model="passwordRepeat"
            :rules="[
              (value) => value === formData.password || '两次密码不一致',
            ]"
            lazy-rules
            type="password"
            autocomplete="off"
            label="再次输入新密码"
          />
        </q-card-section>
        <q-card-actions>
          <q-space />
          <q-btn label="取消" @click="dialogVisible = false" />
          <q-btn type="submit" label="确认" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { changeUserPassword, UserData } from '@/api/system/user'
import { useQuasar } from 'quasar'
import { ref } from 'vue'

const props = defineProps<{
  user: UserData
}>()
const emit = defineEmits<{
  (e: 'refresh'): void
}>()
const $q = useQuasar()
const dialogVisible = ref(false)
const formData = ref<{
  userId: number
  password: string
  oldPassword: string
}>({
  userId: props.user.id,
  password: '',
  oldPassword: '',
})

const passwordRepeat = ref('')

const onSubmit = () => {
  changeUserPassword(formData.value)
    .then((res: any) => {
      if (res.code === 200) {
        dialogVisible.value = false
        $q.notify({ type: 'positive', message: '密码修改成功' })
        emit('refresh')
      } else {
        $q.notify({ type: 'negative', message: res.data })
      }
    })
    .catch((err) => {
      console.log(err)
      $q.notify({ type: 'negative', message: JSON.stringify(err) })
    })
}
</script>

<style scoped lang="scss">
.user_edit {
  min-width: 30rem;

  .q-card__actions .q-btn {
    min-width: 64px;
  }
  .q-card__actions {
    padding: 16px;
  }
}
</style>
