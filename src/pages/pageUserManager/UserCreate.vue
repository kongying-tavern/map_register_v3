<template>
  <q-btn dense icon-right="add" @click="dialogVisible = true">新增用户</q-btn>

  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="user_editor" style="min-width: 30rem">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">编辑用户</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>
      <q-card-section>
        <q-form>
          <q-input v-model="formData.username" label="用户名"></q-input>
          <q-input v-model="formData.nickName" label="昵称"></q-input>
          <q-input v-model="formData.qq" label="qq"></q-input>
          <q-input v-model="formData.phone" label="电话"></q-input>
        </q-form>
      </q-card-section>
      <q-card-section>
        <q-btn label="取消" @click="dialogVisible = false" />
        <q-btn label="确认" color="primary" @click="onConfirm" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
const formData = ref({
  username: '',
  nickName: '',
  qq: '',
  phone: '',
})
const onConfirm = () => {
  console.log('confirm')
}
const dialogVisible = ref(false)
export default defineComponent({
  setup() {
    return {
      formData,
      dialogVisible,
      onConfirm,
    }
  },
})
</script>
