<template>
  <q-btn
    class="table_action_btn"
    icon-right="upload"
    label="csv导入"
    @click="dialogVisible = true"
  />

  <q-dialog v-model="dialogVisible" @hide="clearData">
    <q-card class="dialog_import">
      <q-card-section horizontal class="file_picker">
        <input
          id="file"
          type="file"
          accept="text/csv,.csv"
          style="display: none"
          @change="onFileSelect"
        />
        <div v-if="csvFile">
          <span>
            {{ csvFile?.name }} {{ (csvFile?.size / 1000).toFixed(2) }} kb
          </span>
          <q-icon
            name="mdi-delete-outline"
            size="24px"
            color="grey-6"
            @click="clearData"
          />
        </div>
      </q-card-section>
      <q-card-section v-if="csvFile" class="csv_preview">
        <q-checkbox v-model="csvHasHeader" label="csv文件含表头" />
        <q-table
          dense
          :rows="
            csvHasHeader ? newUserList.filter((row, i) => i !== 0) : newUserList
          "
          :columns="columns"
          :rows-per-page-options="[10, 20, 30, 50]"
          :pagination="{
            sortBy: 'desc',
            descending: false,
            rowsPerPage: 15,
          }"
        >
        </q-table>
      </q-card-section>
      <q-card-section
        v-else
        class="file_drop"
        :class="{ active: fileDropActive }"
        @dragenter.prevent="toggleActive"
        @dragleave.prevent="toggleActive"
        @dragover.prevent
        @drop.prevent="onFileDrop"
      >
        <label for="file"></label>
        <q-icon name="mdi-import" size="48px" color="grey-5" />
        <span>点击或者拖动文件到该区域来上传 </span>
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
import { useQuasar } from 'quasar'
import { defineComponent, ref } from 'vue'
const csvFile = ref<File | null>(null)
const newUserList = ref<{ username: string; password: string }[]>([])
const csvHasHeader = ref<boolean>(true)
const fileDropActive = ref<boolean>(false)

const toggleActive = () => {
  fileDropActive.value = !fileDropActive.value
}
const clearData = () => {
  csvFile.value = null
  newUserList.value = []
}

const columns = [
  {
    name: 'username',
    label: '用户名',
    field: (row: any) => row.username,
  },
  {
    name: 'password',
    label: '密码',
    field: (row: any) => row.password,
  },
]
const readUploadedFileAsText = (inputFile: File) => {
  const temporaryFileReader = new FileReader()

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort()
      reject(new DOMException('Problem parsing input file.'))
    }

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result)
    }
    temporaryFileReader.readAsText(inputFile)
  })
}
const onConfirm = () => {
  const formData = csvHasHeader.value
    ? newUserList.value.filter((row, i) => i !== 0)
    : newUserList
  console.log(formData)
}
export default defineComponent({
  setup() {
    const $q = useQuasar()
    const onFileDrop = (e: DragEvent) => {
      const files = e.dataTransfer?.files
      if (!files || files.length === 0)
        $q.notify({ type: 'negative', message: '选择文件出错' })
      if (files && files.length > 1)
        $q.notify({
          type: 'warning',
          message: '已选多个文件，将默认读取第一个文件',
        })
      if (files && files.length > 0) {
        previewFileData(files[0])
        csvFile.value = files[0]
      }
    }
    const onFileSelect = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (!target.files || target.files.length === 0)
        $q.notify({ type: 'warning', message: '已取消' })
      else if (target.files[0].size > 1048576)
        $q.notify({ type: 'negative', message: '文件超过1MB' })
      else {
        $q.loading.show()
        previewFileData(target.files[0])
        csvFile.value = target.files[0]
      }
    }
    const previewFileData = (value: File) => {
      readUploadedFileAsText(value)
        .then((res) => {
          newUserList.value = []
          if (typeof res === 'string' && res.length > 0) {
            const rows = res.split('\n')
            rows.forEach((row) => {
              let rowData = row.split(',')
              newUserList.value.push({
                username: rowData[0],
                password: rowData[1],
              })
            })
          }
          $q.loading.hide()
        })
        .catch((err) => {
          $q.loading.hide()
          $q.notify({
            type: 'negative',
            message: 'FileReader Error ' + JSON.stringify(err),
          })
        })
    }
    return {
      csvFile,
      newUserList,
      clearData,
      previewFileData,
      csvHasHeader,
      dialogVisible: ref(false),
      columns,
      onConfirm,
      fileDropActive,
      toggleActive,
      onFileSelect,
      onFileDrop,
    }
  },
})
</script>
<style lang="scss" scoped>
.dialog_import {
  width: 72vw;
  min-width: 360px;
  max-width: 840px;
  height: 50rem;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  .file_picker {
    padding: 16px 16px 0;

    span {
      font-weight: bold;
    }
    i.q-icon {
      cursor: pointer;
    }
  }
  .csv_preview,
  .file_drop {
    width: 100%;
    box-sizing: border-box;
    padding: 16px;
    flex: 1;

    label {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .file_drop {
    width: calc(100% - 32px);
    border: 1px dashed rgb(224, 224, 230);
    background: rgb(250, 250, 252);
    text-align: center;
    border-radius: 4px;
    margin: 16px;
    transition: border 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &:hover,
    &.active {
      border-color: $primary;
    }
    span {
      color: rgb(51, 54, 57);
      font-size: 1rem;
    }
  }
}
.table_action_btn {
  margin-right: 8px;
}
</style>
