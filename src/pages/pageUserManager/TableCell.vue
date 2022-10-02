<template>
  <div class="table_cell_content" @click="user = rowData">
    {{ rowData[field] || '-' }}
  </div>
  <q-popup-edit
    v-slot="scope"
    v-model="user[field]"
    style="display: flex"
    anchor="center left"
    @save="(val: string) => editUser({...user, [field]: val})"
  >
    <q-input v-model="scope.value" type="text" dense autofocus>
      <template #after>
        <q-btn
          flat
          dense
          round
          color="negative"
          icon="cancel"
          @click.stop.prevent="scope.cancel"
        />
        <q-btn
          flat
          dense
          round
          color="positive"
          icon="check_circle"
          :disable="
            scope.validate(scope.value) === false ||
            scope.initialValue === scope.value
          "
          @click.stop.prevent="scope.set"
        />
      </template>
    </q-input>
  </q-popup-edit>
</template>
<script lang="ts" setup>
import { updateUser, UserData } from '@/api/system/user'
import { useQuasar } from 'quasar'
import { ref } from 'vue'
const $q = useQuasar()
const props = defineProps<{
  rowData: UserData
  field: 'username' | 'nickname' | 'qq' | 'phone'
}>()
const user = ref(props.rowData)
const emit = defineEmits<{
  (e: 'update', row: UserData): void
}>()
const editUser = (data: UserData) => {
  updateUser(data)
    .then((res: any) => {
      if (res.code === 200) {
        $q.notify({ type: 'positive', message: '修改成功' })
        emit('update', data)
      } else {
        $q.notify({ type: 'negative', message: JSON.stringify(res.data) })
      }
    })
    .catch((err) => {
      console.log(err)
      $q.notify({ type: 'negative', message: JSON.stringify(err) })
    })
}
</script>

<style>
.table_cell_content {
  padding: 0 8px;
  font-size: 14px;
  min-width: 75px;
}
</style>
