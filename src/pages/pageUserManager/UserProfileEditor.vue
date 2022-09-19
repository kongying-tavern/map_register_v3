<template>
  <q-btn
    dense
    round
    flat
    color="grey"
    icon="edit"
    @click="dialogVisible = true"
  ></q-btn>
  <q-dialog :model-value="dialogVisible" persistent>
    <q-card class="user_edit">
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">编辑用户</div>
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
          <q-input v-model="formData.id" name="id" label="id" disable></q-input>
          <q-input
            :model-value="user.username"
            name="username"
            label="用户名"
          ></q-input>
          <q-input
            v-model="formData.nickname"
            name="nickname"
            label="昵称"
          ></q-input>
          <q-input v-model="formData.qq" name="qq" label="qq"></q-input>
          <q-input v-model="formData.phone" name="phone" label="电话"></q-input>
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

<script setup lang="ts">
import { deleteUser, updateUser, UserData } from '@/api/system/user'
import { useQuasar } from 'quasar'
import { ref } from 'vue'

const props = defineProps<{
  user: UserData
}>()
const emit = defineEmits<{
  (e: 'update', row: UserData): void
  (e: 'refresh'): void
}>()
const $q = useQuasar()
const dialogVisible = ref(false)
const formData: any = ref({
  ...props.user,
})

const onSubmit = () => {
  updateUser(formData.value)
    .then((res: any) => {
      if (res.code === 200) {
        dialogVisible.value = false
        $q.notify({ type: 'positive', message: '修改成功' })
        emit('update', formData.value)
      }
    })
    .catch((err) => {
      console.log(err)
      $q.notify({ type: 'negative', message: JSON.stringify(err) })
    })
}

const onClickDeleteUser = () => {
  $q.dialog({
    title: '删除用户',
    message: `确认删除用户 ID - ${props.user.id}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteUser(props.user.id)
      .then((res: any) => {
        if (res.code === 200) {
          $q.notify({
            type: 'positive',
            message: `确认删除用户 ID - ${props.user.id}?`,
          })
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
  })
}
defineExpose({
  onSubmit,
})
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
