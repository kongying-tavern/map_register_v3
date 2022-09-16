<template>
  <q-btn
    class="table_action_btn"
    icon-right="upload"
    label="csv导入"
    @click="dialogVisible = true"
  />

  <q-dialog v-model="dialogVisible" @hide="clearData">
    <q-card class="dialog_container">
      <q-card-section horizontal class="file_picker">
        <q-file
          v-model="csvFile"
          dense
          filled
          label="用户批量导入"
          accept=".csv"
          style="width: 240px"
          @update:model-value="onFileSelected"
          @clear="clearData"
        >
          <template #prepend>
            <q-icon name="cloud_upload" @click.stop.prevent />
          </template>
          <template #append>
            <q-icon
              name="close"
              class="cursor-pointer"
              @click.stop.prevent="csvFile = null"
            />
          </template>
        </q-file>
        <q-checkbox v-model="csvHasHeader" label="csv文件含表头" />
      </q-card-section>
      <q-card-section v-if="csvFile" class="csv-preview">
        <q-table
          dense
          :columns="columns"
          :rows="
            csvHasHeader ? newUserList.filter((row, i) => i !== 0) : newUserList
          "
          :rows-per-page-options="[10, 20, 30, 50]"
          :pagination="{
            sortBy: 'desc',
            descending: false,
            rowsPerPage: 15,
          }"
        >
        </q-table>
      </q-card-section>
      <q-card-section v-else class="csv-preview placeholder">
        <div>no data</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="取消" @click="dialogVisible = false" />
        <q-btn
          label="确定"
          color="primary"
          :disable="!csvFile"
          @click="onConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { UserProfile } from '@/api/system/user'
import { defineComponent, ref } from 'vue'
const csvFile = ref<File | null>(null)
const newUserList = ref<UserProfile[]>([])
const csvHasHeader = ref<boolean>(true)
const clearData = () => {
  csvFile.value = null
  newUserList.value = []
}
const onFileSelected = (value: File) => {
  const reader = new FileReader()
  reader.readAsBinaryString(value)
  reader.onloadend = function () {
    console.log(reader.result)
    newUserList.value = []
    if (typeof reader.result === 'string' && reader.result.length > 0) {
      const rows = reader.result.split('\n')
      console.log(rows)
      rows.forEach((row) => {
        const rowData = row.split(',')
        newUserList.value.push({
          username: rowData[0],
          nickname: rowData[1],
          qq: rowData[2],
          phone: rowData[3],
        })
      })
    }
  }
}
const columns = [
  {
    name: 'username',
    label: '用户名',
    field: (row: UserProfile) => row.username,
  },
  {
    name: 'nickname',
    label: '昵称',
    field: (row: UserProfile) => row.nickname,
  },
  { name: 'qq', label: 'qq', field: (row: UserProfile) => row.qq },
  { name: 'phone', label: '电话', field: (row: UserProfile) => row.phone },
]
const onConfirm = () => {
  const formData = csvHasHeader.value
    ? newUserList.value.filter((row, i) => i !== 0)
    : newUserList
  console.log(formData)
}
export default defineComponent({
  setup() {
    return {
      csvFile,
      newUserList,
      clearData,
      onFileSelected,
      csvHasHeader,
      dialogVisible: ref(false),
      columns,
      onConfirm,
    }
  },
})
</script>
<style scoped lang="scss">
.dialog_container {
  width: 60rem;
  max-width: 80vw;
  height: 50rem;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  .file_picker {
    padding: 16px;
  }
  .csv-preview.placeholder {
    width: 100%;
    padding: 16px;
    flex: 1;
    text-align: center;
  }

  .q-card__actions {
    margin: 16px;
  }
}
</style>
