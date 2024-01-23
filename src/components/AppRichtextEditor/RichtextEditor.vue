<script lang="ts" setup>
import { EditorContent, useEditor } from '@tiptap/vue-3'
import type { Extension } from '@tiptap/core'
import TextAlign from '@tiptap/extension-text-align'
import StarterKit from '@tiptap/starter-kit'
import { Color, Size } from './marks'
import { TextSize, TextColor } from './extensions'
import { HeaderToolbar } from './components'

withDefaults(defineProps<{
  contentHeight?: number
  sizeRatio?: number
}>(), {
  sizeRatio: 1,
})

const modelValue = defineModel<string>('modelValue', {
  required: false,
  default: '',
  type: String,
})

const editor = useEditor({
  content: modelValue.value,
  extensions: [
    StarterKit as Extension,
    TextAlign,
    TextColor,
    TextSize,
    Color,
    Size,
  ],
})

watch(modelValue, (newContent) => {
  if (!editor.value)
    return
  if (editor.value.getHTML() === newContent)
    return
  editor.value.commands.setContent(newContent, false)
})

onMounted(() => nextTick(() => {
  const instance = editor.value
  if (!instance)
    return

  instance.on('update', ({ editor }) => {
    modelValue.value = editor.getHTML()
  })

  Reflect.set(window, 'editor', instance)
}))
</script>

<template>
  <div v-if="editor" class="richtext-editor flex-1">
    <HeaderToolbar :editor="editor" :basesize="16 / sizeRatio" />
    <EditorContent class="editor-instance" :editor="editor" />
  </div>
</template>

<style scoped>
.richtext-editor {
  --sizeUnit: calc(v-bind('sizeRatio') * 1px);

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  transition: border-color var(--el-transition-duration-fast) var(--el-transition-function-ease-in-out-bezier);

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  &:focus-within {
    border-color: var(--el-color-primary);
  }
}

.editor-instance {
  flex: 1;
  width: 100%;
  overflow: auto;

  :deep(.tiptap) {
    outline: none;
    cursor: text;
    padding: 8px;
    min-height: 100%;
    font-size: 16px;
    color: var(--el-text-color-primary);
    height: calc(v-bind('contentHeight') * 1px);

    color {
      color: var(--color);
    }

    size {
      font-size: calc(var(--size, 16 / v-bind('sizeRatio')) * var(--sizeUnit));
    }
  }
}
</style>
