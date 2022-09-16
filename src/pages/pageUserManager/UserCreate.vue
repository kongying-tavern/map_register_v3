<template>
  <q-btn
    class="table_action_btn"
    icon-right="add"
    label="新增用户"
    @click="dialogVisible = true"
  />

  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="user_editor" style="min-width: 30rem">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">新增用户</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>
      <q-card-section>
        <q-form class="user_create_form">
          <q-input
            v-model="formData.username"
            :rules="[(val) => val.length >= 5 || '请至少输入5个字符']"
            label="用户名"
          ></q-input>
          <q-input
            v-model="formData.nickname"
            :rules="[(val) => val.length >= 3 || '请至少输入1个字符']"
            label="昵称"
          ></q-input>
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
  nickname: '',
  qq: '',
  phone: '',
})
const onConfirm = () => {
  if (
    formData.value.nickname.length > 0 &&
    formData.value.username.length >= 5
  ) {
    console.log('confirm', formData.value)
  }
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

<style lang="scss">
.table_action_btn {
  margin-right: 8px;
}
.table_action_btn:first-child {
  margin-left: 8px;
}
</style>
