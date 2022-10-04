<template>
  <q-btn
    class="table_action_btn"
    outline
    color="negative"
    style="margin-left: 8px"
    icon-right="mdi-trash-can-outline"
    :disable="!selected.length"
    :loading="loading"
    @click="
      () => {
        dialogVisible = true
        usersToDelete = selected
      }
    "
  >
    批量删除
  </q-btn>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="user_delete" style="min-width: 40rem">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">批量删除用户</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>
      <q-card-section>
        <p>是否确认删除以下{{ selected.length }} 个用户</p>
        <UsersPreview :users="usersToDelete" />
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn label="取消" @click="dialogVisible = false" />
        <q-btn label="确认" color="primary" @click="deleteSelectedUsers" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import UsersPreview from './UsersPreviewTable.vue'
import { deleteUser, UserData } from '@/api/system/user'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { messageFrom } from '@/utils'

const props = defineProps<{
  selected: UserData[]
}>()
const dialogVisible = ref(false)
const usersToDelete = ref<UserData[]>([...props.selected])
const loading = ref(false)
const emit = defineEmits<{
  (e: 'refresh'): void
}>()
const $q = useQuasar()
const deleteSelectedUsers = () => {
  const getDeleteSingleUserPromise = (id: number) => {
    return deleteUser(id).then((res) => {
      usersToDelete.value = usersToDelete.value.filter((item) => item.id !== id)
      return res
    })
  }

  Promise.all(props.selected.map((item) => getDeleteSingleUserPromise(item.id)))
    .then((res: any) => {
      console.log(res)
      dialogVisible.value = false
      emit('refresh')
      $q.notify({
        type: 'positive',
        message: '成功',
      })
    })
    .catch((err) => {
      $q.notify({
        type: 'positive',
        message: messageFrom(err),
      })
    })
}
</script>

<style scoped lang="scss">
.user_delete_table {
  max-height: 30rem;
}
</style>
