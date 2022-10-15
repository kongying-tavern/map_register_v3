<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import System from '@/api/system'
import { messageFrom } from '@/utils'

const props = defineProps<{
  user: API.SysUserVo
}>()
const emit = defineEmits<{
  (e: 'update', row: API.SysUserVo): void
  (e: 'refresh'): void
}>()
const $q = useQuasar()
const dialogVisible = ref(false)
const formData: any = ref({
  ...props.user,
})

const onSubmit = () => {
  System.sysUserController.updateUser({}, formData.value)
    .then((res: any) => {
      if (res.code === 200)
        emit('update', formData.value)
      dialogVisible.value = false
      $q.notify({
        type: res.code === 200 ? 'positive' : 'negative',
        message: res.message,
      })
    })
    .catch((err) => {
      console.log(err)
      $q.notify({ type: 'negative', message: messageFrom(err) })
    })
}

const onClickDeleteUser = () => {
  $q.dialog({
    title: '删除用户',
    message: `确认删除用户 ID - ${props.user.id}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (!props.user.id)
      return
    System.sysUserController.deleteUser({ workId: props.user.id })
      .then((res: any) => {
        $q.notify({
          type: res.code === 200 ? 'positive' : 'negative',
          message: res.message,
        })
        emit('refresh')
      })
      .catch((err: any) => {
        console.log(err)
        $q.notify({ type: 'negative', message: messageFrom(err) })
      })
      .then(() => {
        dialogVisible.value = false
      })
  })
}
</script>

<template>
  <q-btn dense flat color="primary" @click="dialogVisible = true">
    编辑用户
  </q-btn>
  <q-dialog :model-value="dialogVisible" persistent>
    <q-card class="user_edit">
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            编辑用户
          </div>
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
          <q-input v-model="formData.id" name="id" label="id" disable />
          <q-input v-model="formData.username" name="username" label="用户名" />
          <q-input v-model="formData.nickname" name="nickname" label="昵称" />
          <q-input v-model="formData.qq" name="qq" label="qq" />
          <q-input v-model="formData.phone" name="phone" label="电话" />
        </q-card-section>
        <q-card-actions>
          <q-btn
            flat
            label="删除用户"
            style="color: red"
            @click="onClickDeleteUser"
          />
          <q-space />
          <q-btn label="取消" @click="dialogVisible = false" />
          <q-btn type="submit" label="确认" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

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
