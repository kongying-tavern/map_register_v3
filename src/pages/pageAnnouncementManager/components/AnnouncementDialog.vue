<script lang="ts" setup>
import type { ComputedRef } from 'vue'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import UnityKit from '@766aya/unity-kit'
import type { AnyExtension } from '@tiptap/vue-3'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { ElMessage } from 'element-plus'
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
  for (const key in val)
    formData[key] = val[key]
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
      <el-form-item label="频道" prop="channel">
        <el-select-v2 v-model="formData.channel" style="width: 100%" placeholder="请选择频道" :options="channelsDict" clearable />
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" clearable />
      </el-form-item>
      <el-form-item label="发布时间" prop="validTimeStart">
        <el-date-picker v-model="formData.validTimeStart" style="--el-date-editor-width: 100%" type="datetime" value-format="x" placeholder="请选择发布时间" />
      </el-form-item>
      <el-form-item label="失效时间" prop="validTimeEnd">
        <el-date-picker v-model="formData.validTimeEnd" style="--el-date-editor-width: 100%" type="datetime" value-format="x" placeholder="请选择失效时间" />
      </el-form-item>
      <el-form-item label="公告内容" prop="content">
        <div class="announcement-editor">
          <div class="toolbar">
            <div class="tool-item tool-item-bold" @click="editor.chain().focus().toggleBold().run()">
              <svg viewBox="0 0 1024 1024" p-id="4380" width="64" height="64"><path d="M311.296 460.8h266.24c59.392 0 108.544-49.152 108.544-108.544s-49.152-108.544-108.544-108.544h-266.24V460.8z m-30.72-296.96h296.96c104.448 0 190.464 83.968 190.464 190.464 0 55.296-22.528 104.448-61.44 139.264 55.296 34.816 92.16 98.304 92.16 167.936 0 110.592-90.112 198.656-198.656 198.656h-368.64v-696.32h49.152z m30.72 614.4h286.72c65.536 0 116.736-53.248 116.736-116.736s-53.248-116.736-116.736-116.736h-286.72v233.472z" fill="currentColor" p-id="4381" /></svg>
            </div>
            <div class="tool-item tool-item-italic" @click="editor.chain().focus().toggleItalic().run()">
              <svg viewBox="0 0 1024 1024" p-id="5393" width="64" height="64"><path d="M415.3 63.9l-9.3 45.8c87.3-3.4 121.8 23.7 103.4 81.4l-130 636.1c-6.5 64.5-52.3 93.3-137.7 86.5l-9.3 45.8h375l9.3-45.8c-91.4 6.8-125.5-22-102.3-86.5l130-636.1c1.8-57.7 47.3-84.8 136.6-81.4l9.3-45.8h-375z" fill="currentColor" p-id="5394" /></svg>
            </div>
            <el-popover
              placement="bottom"
              width="fit-content"
              trigger="hover"
            >
              <template #reference>
                <div class="tool-item tool-item-color">
                  <svg viewBox="0 0 1024 1024" p-id="6524" width="64" height="64"><path d="M768 800a31.36 31.36 0 0 1-29.44-19.84L512 214.4l-226.56 565.76a32 32 0 1 1-58.88-24.32l256-640a32.64 32.64 0 0 1 58.88 0l256 640a31.36 31.36 0 0 1-17.28 41.6 29.44 29.44 0 0 1-12.16 2.56z" p-id="6525" fill="currentColor" /><path d="M657.92 544H358.4a32 32 0 0 1 0-64h299.52a32 32 0 1 1 0 64zM800 960h-576a32 32 0 0 1 0-64h576a32 32 0 0 1 0 64z" p-id="6526" fill="currentColor" /></svg>
                </div>
              </template>
              <div class="editor-color-layout">
                <div v-for="item in colors" :key="item" class="color-item" :style="{ '--color': item }" @click="editor.chain().focus().setColor(item).run()" />
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
      &-italic {
        svg {
          height: 60%;
        }
      }
    }
  }

  .editor {
    width: 100%;
    height: 120px;
    overflow: hidden;

    size {
      font-size: calc(var(--size, 1) * 14px);
    }

    color {
      color: var(--color, #000000);
    }

    .tiptap  {
      width: 100%;
      height: 100%;
      outline: none;
      border: 1px solid #DCDFE6;
      transition: .3s;
      padding: 0 10px;
      border-radius: 0 0 3px 3px;
      cursor: text;

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
