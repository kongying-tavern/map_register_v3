<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import System from '@/api/system'
import { messageFrom } from '@/utils'

const props = defineProps<{
  user: API.SysUserVo
}>()
const emits = defineEmits<{
  (e: 'update', row: API.SysUserVo): void
  (e: 'refresh'): void
}>()

const dialogVisible = ref(false)
const formData = ref({
  ...props.user,
})

const onSubmit = async () => {
  try {
    const res = await System.sysUserController.updateUser({}, formData.value)
    ElMessage.success(res.message ?? '成功')
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
}

const onClickDeleteUser = async () => {
  if (!props.user.id)
    return
  try {
    await ElMessageBox
      .confirm(`确认删除用户 ID - ${props.user.id}?`, '删除用户')
      // cancel with no action
      .catch(() => false)
    const res = await System.sysUserController.deleteUser({ workId: props.user.id })
    ElMessage.success(res.message ?? '成功')
    emits('refresh')
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
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
          <q-input v-model="formData.id" name="id" label="id" readonly />
          <q-input v-model="formData.username" name="username" label="用户名" readonly />
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
