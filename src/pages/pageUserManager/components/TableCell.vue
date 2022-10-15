<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import System from '@/api/system'
import { messageFrom } from '@/utils'

const props = defineProps<{
  rowData: API.SysUserVo
  field: 'username' | 'nickname' | 'qq' | 'phone'
}>()
const emit = defineEmits<{
  (e: 'update', row: API.SysUserVo): void
}>()
const $q = useQuasar()
const user = ref(props.rowData)
const editUser = (data: API.SysUserVo) => {
  System.sysUserController.updateUser({}, data)
    .then((res: any) => {
      if (res.code === 200)
        emit('update', data)
      $q.notify({
        type: res.code === 200 ? 'positive' : 'negative',
        message: messageFrom(res),
      })
    })
    .catch((err) => {
      // console.log(err)
      $q.notify({ type: 'negative', message: messageFrom(err) })
    })
}
</script>

<template>
  <div class="table_cell_content" @click="user = rowData">
    {{ rowData[field] || '-' }}
  </div>
  <q-popup-edit
    v-slot="scope"
    v-model="user[field]"
    style="display: flex"
    anchor="center left"
    @save="(val: string) => editUser({ ...user, [field]: val })"
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
            scope.validate(scope.value) === false
              || scope.initialValue === scope.value
          "
          @click.stop.prevent="scope.set"
        />
      </template>
    </q-input>
  </q-popup-edit>
</template>

<style>
.table_cell_content {
  padding: 0 8px;
  font-size: 14px;
  min-width: 75px;
}
</style>
