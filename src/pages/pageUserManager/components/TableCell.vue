<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import System from '@/api/system'
import { messageFrom } from '@/utils'

const props = defineProps<{
  rowData: API.SysUserVo
  readonly?: boolean
  field: 'username' | 'nickname' | 'qq' | 'phone'
}>()

const emits = defineEmits<{
  (e: 'update', row: API.SysUserVo): void
}>()

const $q = useQuasar()
const user = ref(props.rowData)
const editUser = async ({ id, roleList, username, ...rest }: API.SysUserVo) => {
  const covertData = { userId: id, ...rest }
  try {
    const res = await System.sysUserController.updateUser({}, covertData)
    emits('update', covertData)
    $q.notify({
      type: 'positive',
      message: messageFrom(res.message),
    })
  }
  catch (err) {
    $q.notify({ type: 'negative', message: messageFrom(err) })
  }
}
</script>

<template>
  <td>
    <div class="table_cell_content" @click="user = rowData">
      {{ rowData[field] || '-' }}
    </div>
    <q-popup-edit
      v-slot="scope"
      v-model="user[field]"
      :disable="props.readonly"
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
  </td>
</template>

<style>
.table_cell_content {
  padding: 0 8px;
  font-size: 14px;
  min-width: 75px;
}
</style>
