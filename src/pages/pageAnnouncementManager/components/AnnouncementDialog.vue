<script lang="ts" setup>
import UnityKit from '@766aya/unity-kit'
import type { AnyExtension } from '@tiptap/vue-3'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { ElMessage } from 'element-plus'
import type { ComputedRef } from 'vue'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { channelsDict } from '../const/dictionary'
import type { ItemFormRules } from '@/utils'
import type { ElFormType } from '@/shared'
import { GlobalDialogController, useFetchHook } from '@/hooks'
import Api from '@/api/api'

const props = defineProps<{
  form: API.NoticeVo
  status: 'detail' | 'create' | 'update'
}>()

const emits = defineEmits<{
  success: []
}>()

const popoverVisible = ref(false)

const formData = reactive<API.NoticeVo>({
  title: '',
})

const formRef = ref<ElFormType | null>(null)

const rules: ComputedRef<ItemFormRules<API.NoticeVo>> = computed(() => ({
  channel: [
    { required: true, message: '公告频道不能为空', trigger: 'change' },
  ],
  title: [
    { required: true, message: '公告标题不能为空', trigger: 'blur' },
  ],
  validTimeStart: [
    {
      required: !!(formData?.validTimeStart && formData?.validTimeEnd),
      validator(rule, value, cb) {
        if (value && formData.validTimeEnd) {
          if (formData.validTimeEnd <= value) {
            cb('失效时间不能大于发布时间')
            return
          }
        }
        cb()
      },
    },
  ],
  validTimeEnd: [
    {
      required: !!(formData?.validTimeStart && formData?.validTimeEnd),
      validator(rule, value, cb) {
        if (value && formData.validTimeStart) {
          if (formData.validTimeStart >= value) {
            cb('失效时间不能大于发布时间')
            return
          }
        }
        cb()
      },
    },
  ],
  content: [
    { required: true, message: '公告内容不能为空', trigger: 'blur' },
  ],
}))

watch(props.form, (val: API.NoticeVo) => {
  Object.assign(val, formData)
}, {
  immediate: true,
})

const editor = new Editor({
  extensions: [UnityKit.configure({}) as AnyExtension],
  parseOptions: {},
  content: formData.content,
})

const { loading, refresh: submit, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    if (props.status === 'create')
      await Api.notice.createNotice(formData)
    else if (props.status === 'update')
      await Api.notice.updateNotice(formData)
  },
})

editor.on('update', ({ editor }) => {
  formData.content = editor.getHTML()
})

const createNotice = async () => {
  try {
    await formRef.value?.validate()
    await submit()
  }
  catch {
    // inValid form, no error
  }
}

onSuccess(() => {
  ElMessage.success({
    message: '新增公告成功',
    offset: 48,
  })
  GlobalDialogController.close()
  emits('success')
})

const statusMap = {
  detail: '详情',
  create: '新增',
  update: '修改',
}

onError((err: Error) => ElMessage.error({
  message: `${statusMap[props.status || 'detail']}公告失败，原因为：${err.message}`,
  offset: 48,
}))

onBeforeUnmount(() => {
  editor && editor.destroy()
})

const colors = [
  '#FF8080',
  '#FFFF80',
  '#80FF80',
  '#00FF80',
  '#80FFFF',
  '#0080FF',
  '#FF80C0',
  '#FF80FF',
  '#FF0000',
  '#FFFF00',
  '#80FF00',
  '#00FF40',
  '#00FFFF',
  '#0080C0',
  '#0080C0',
  '#FF00FF',
  '#804040',
  '#FF8040',
  '#00FF00',
  '#008080',
  '#004080',
  '#8080FF',
  '#800040',
  '#FF0080',
  '#800000',
  '#FF8000',
  '#008000',
  '#008040',
  '#0000FF',
  '#0000A0',
  '#800080',
  '#8000FF',
  '#400000',
  '#804000',
  '#004000',
  '#004040',
  '#000080',
  '#000040',
  '#400040',
  '#400080',
  '#FFFFFF',
  '#808000',
  '#808040',
  '#808080',
  '#408080',
  '#C0C0C0',
  '#400040',
]
</script>

<template>
  <div class="p-5">
    <el-form ref="formRef" v-bind="$attrs" label-width="100px" :model="formData" :rules="rules">
      <el-row>
        <el-col :span="12">
          <el-form-item label="频道" prop="channel">
            <el-select-v2 v-model="formData.channel" style="width: 100%" placeholder="请选择频道" :options="channelsDict" clearable multiple />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入标题" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布时间" prop="validTimeStart">
            <el-date-picker v-model="formData.validTimeStart" style="--el-date-editor-width: 100%" type="datetime" value-format="x" placeholder="请选择发布时间" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="失效时间" prop="validTimeEnd">
            <el-date-picker v-model="formData.validTimeEnd" style="--el-date-editor-width: 100%" type="datetime" value-format="x" placeholder="请选择失效时间" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="公告内容" prop="content">
            <div class="announcement-editor">
              <div class="toolbar">
                <div class="tool-item tool-item-bold" @click="editor.chain().focus().toggleBold().run()">
                  <svg viewBox="0 0 1024 1024" width="64" height="64"><path d="M291.58 249.48h261.37c48.21 0 86.87 12.13 116 36.38 29.12 24.26 43.69 60.91 43.69 109.97 0 29.77-6.66 55.27-19.96 76.48-13.31 21.23-32.27 37.62-56.87 49.2v1.65c33.14 7.73 58.25 24.95 75.32 51.68 17.07 26.74 25.61 60.23 25.61 100.46 0 23.15-3.77 44.79-11.3 64.91-7.53 20.13-19.34 37.49-35.4 52.09-16.08 14.61-36.66 26.19-61.76 34.73-25.12 8.55-54.99 12.82-89.63 12.82H291.58V249.48z m94.15 247.22h153.66c22.6 0 41.43-7.03 56.49-21.08 15.06-14.06 22.6-34.31 22.6-60.77 0-29.77-6.78-50.71-20.34-62.84-13.56-12.12-33.14-18.19-58.75-18.19H385.73V496.7z m0 258.8h166.46c28.62 0 50.84-8.13 66.66-24.39 15.82-16.25 23.73-39.27 23.73-69.04 0-29.21-7.91-51.68-23.73-67.39s-38.04-23.56-66.66-23.56H385.73V755.5z" fill="currentColor" /></svg>
                </div>
                <div class="tool-item tool-item-italic" @click="editor.chain().focus().toggleItalic().run()">
                  <svg viewBox="0 0 1024 1024" width="64" height="64"><path d="M603.54 276.12l-97.07 533.93H422.2l97.07-533.93h84.27z" fill="currentColor" p-id="1016" /><path d="M709.99 346.99H387.06l13.88-76.36h322.93l-13.88 76.36zM625.68 810.69H302.75l13.88-76.35h322.93l-13.88 76.35z" fill="currentColor" p-id="1017" /></svg>
                </div>
                <div class="tool-item tool-item-title" @click="editor.chain().focus().setBold().setSize(1.5).setColor('#000000').run()">
                  <svg viewBox="0 0 1024 1024" width="64" height="64"><path d="M720.11 622.26c7.7 0 15.19-0.64 22.47-1.93 7.27-1.28 13.85-3.42 19.74-6.42 5.88-2.99 10.91-6.85 15.09-11.55 4.17-4.7 6.9-10.48 8.18-17.33h29.85V809.7h-40.12V651.15h-55.21v-28.89zM210.51 462.46h410.22v100.19H210.51z" fill="currentColor" p-id="1490" /><path d="M572.09 809.716v-594.32h100.19v594.32zM210.517 809.714v-594.32h100.19v594.32z" fill="currentColor" p-id="1491" /></svg>
                </div>
                <div class="tool-item tool-item-subtitle" @click="editor.chain().focus().setBold().setSize(1.2).setColor('#000000').run()">
                  <svg viewBox="0 0 1024 1024" width="64" height="64"><path d="M844.46 809.7H691.05c0.21-18.62 4.7-34.87 13.48-48.79 8.77-13.91 20.75-26 35.95-36.27 7.27-5.35 14.87-10.54 22.79-15.57 7.91-5.03 15.19-10.43 21.83-16.21 6.63-5.78 12.09-12.04 16.37-18.78 4.28-6.74 6.52-14.49 6.74-23.27 0-4.06-0.48-8.4-1.44-13s-2.84-8.88-5.62-12.84c-2.78-3.96-6.63-7.27-11.55-9.95-4.92-2.67-11.34-4.01-19.26-4.01-7.28 0-13.32 1.44-18.13 4.33s-8.67 6.85-11.55 11.88c-2.89 5.03-5.03 10.97-6.42 17.81-1.39 6.85-2.2 14.23-2.41 22.15h-36.59c0-12.41 1.66-23.91 4.98-34.5 3.31-10.59 8.29-19.74 14.92-27.44 6.63-7.7 14.71-13.75 24.23-18.13 9.52-4.38 20.59-6.58 33.22-6.58 13.69 0 25.14 2.25 34.34 6.74 9.2 4.49 16.63 10.17 22.31 17.01 5.67 6.85 9.68 14.28 12.04 22.31 2.35 8.02 3.53 15.68 3.53 22.95 0 8.99-1.39 17.12-4.17 24.39a78.66 78.66 0 0 1-11.23 20.06c-4.71 6.1-10.06 11.71-16.05 16.85-5.99 5.14-12.2 9.95-18.62 14.44-6.42 4.49-12.84 8.78-19.26 12.84-6.42 4.07-12.36 8.13-17.81 12.2-5.46 4.07-10.22 8.29-14.28 12.68-4.07 4.39-6.85 9.04-8.34 13.96H844.5v32.74zM185.94 462.46h410.22v100.19H185.94z" fill="currentColor" p-id="1649" /><path d="M547.513 809.72V215.4h100.19v594.32zM185.94 809.717v-594.32h100.19v594.32z" fill="currentColor" p-id="1650" /></svg>
                </div>
                <el-popover
                  placement="bottom"
                  width="fit-content"
                  :visible="popoverVisible"
                  trigger="click"
                >
                  <template #reference>
                    <div class="tool-item tool-item-color" @click="popoverVisible = true">
                      <svg t="1705781883426" class="icon" viewBox="0 0 1024 1024" width="64" height="64"><path d="M490.37 428.91h47.77l98.77 256.44h-48.13l-24.06-67.88H462.35l-24.06 67.88h-46.33l98.41-256.44z m-15.8 154.44h78.3l-38.43-110.26h-1.08l-38.79 110.26z" fill="#333333" p-id="1329" /><path d="M514.6 889.68c-9.53 0-19.12-0.46-28.74-1.37-74.03-7.05-142.07-42.62-191.59-100.16-49.21-57.18-74.72-129.69-71.82-204.17 3.28-84.33 37.06-168.74 100.43-250.9 49.33-63.96 105.22-111.93 143.42-140.9 28.34-21.5 67.98-21.45 96.4 0.13 73.35 55.68 243.95 206.6 243.95 405.14 0 41.89-8.69 82.35-25.82 120.25-16.54 36.59-40.05 68.9-69.87 96.01-29.76 27.06-64.06 47.35-101.94 60.3-30.5 10.43-62.15 15.67-94.42 15.67z m-0.24-645.87c-2.49 0-4.97 0.8-7.08 2.4-28.58 21.68-83.57 67.18-130.7 128.29-54.59 70.78-83.65 142.15-86.36 212.11-2.23 57.29 17.47 113.16 55.46 157.3 38.03 44.2 90.1 71.5 146.61 76.88 32.57 3.1 64.45-0.59 94.78-10.96 29.07-9.94 55.4-25.52 78.26-46.31 22.93-20.85 40.99-45.67 53.69-73.77 13.14-29.06 19.8-60.12 19.8-92.32 0-72.02-28.05-145.62-83.38-218.75-47.69-63.04-104.27-109.99-133.75-132.37-2.2-1.66-4.77-2.5-7.33-2.5z" fill="#333333" p-id="1330" /></svg>
                    </div>
                  </template>
                  <div class="editor-color-layout">
                    <div v-for="item in colors" :key="item" class="color-item" :style="{ '--color': item }" @click="() => { editor.chain().focus().setColor(item).run(); popoverVisible = false }" />
                    <div class="color-item unset" @click="editor.chain().focus().unsetColor().run()" />
                  </div>
                </el-popover>
                <el-popover
                  placement="bottom"
                  width="fit-content"
                  trigger="hover"
                >
                  <template #reference>
                    <div class="tool-item tool-item-size">
                      <svg viewBox="0 0 1024 1024" p-id="7512" width="64" height="64"><path d="M711.328 735.968l-33.792 92.8a32 32 0 0 1-60.16-21.888l130.368-358.08a31.968 31.968 0 0 1 42.016-21.888c10.208 3.712 17.376 12.096 19.968 21.856l130.336 358.08a32 32 0 0 1-60.16 21.92l-33.76-92.8H711.36z m23.264-64h88.256l-44.128-121.28L734.592 672zM234.752 576h202.496L336 297.856 234.752 576z m-23.296 64L144.64 823.648a32 32 0 0 1-60.128-21.888L303.36 200.32a32 32 0 0 1 32.64-20.96 32 32 0 0 1 32.64 20.96l218.88 601.408a32 32 0 0 1-60.16 21.888L460.576 640H211.456z" p-id="7513" fill="currentColor" /></svg>
                    </div>
                  </template>
                  <div class="editor-size-layout">
                    <el-input-number :model-value="1" :step="0.1" @change="(cur) => editor.chain().focus().setSize(cur as number).run()" />
                  </div>
                </el-popover>
              </div>
              <EditorContent class="editor" :editor="editor" />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="pt-4 text-end">
      <el-button type="primary" :loading="loading" @click="createNotice">
        确认
      </el-button>
      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>

<style lang="scss">
.announcement-editor {
  width: 100%;

  .toolbar {
    width: 100%;
    height: 36px;
    background-color: #f7f7f7;
    border-radius: 3px 3px 0 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 6px;
    overflow: hidden;

    .tool-item {
      width: 30px;
      height: 30px;
      cursor: pointer;
      color: #5f5f5f;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 100%;
        height: 80%;
      }
    }
  }

  .editor {
    width: 100%;
    min-height: 120px;
    max-height: 400px;
    overflow: hidden;

    size {
      font-size: calc(var(--size, 1) * 14px);
    }

    color {
      color: var(--color, #000000);
    }

    .tiptap  {
      width: 100%;
      min-height: 120px;
      max-height: 400px;
      outline: none;
      border: 1px solid #DCDFE6;
      transition: .3s;
      padding: 0 10px;
      border-radius: 0 0 3px 3px;
      cursor: text;
      overflow-y: auto;

      &:focus {
        border-color: #409EFF;
      }
    }
  }
}

.editor-color-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 10px;
  .color-item {
    position: relative;
    width: 20px;
    height: 20px;
    background-color: var(--color);
    transition: .3s;
    border: 1px solid #5f5f5f;
    overflow: hidden;
    &:hover {
      box-shadow: 0px 0px 5px #DCDFE6;
    }
    &.unset::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      height: 1px;
      width: 120px;
      transform: translate(-50%, -50%) rotate(45deg);
      background-color: #FF0000;
    }
  }
}
</style>
