<script lang="ts" setup>
import { EditorContent, useEditor } from '@tiptap/vue-3'
import type { Extension } from '@tiptap/core'
import TextStyle from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import StarterKit from '@tiptap/starter-kit'
import { Size } from './marks'
import { TextSize } from './extensions'
import { HeaderToolbar } from './components'

const modelValue = defineModel<string>('modelValue', {
  required: false,
  default: 'One apple a day, keeps the doctor away.',
  type: String,
})

const editor = useEditor({
  // eslint-disable-next-line vue/no-ref-object-reactivity-loss
  content: modelValue.value,
  extensions: [
    StarterKit as Extension,
    TextAlign,
    TextStyle,
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
  <div class="flex h-full">
    <div v-if="editor" class="richtext-editor flex-1">
      <HeaderToolbar :editor="editor" />
      <EditorContent class="editor-instance" :editor="editor" />
    </div>

    <div class="h-full flex-1 border-l-[1px] p-2">
      {{ modelValue }}
    </div>
  </div>
</template>

<style scoped>
.richtext-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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
    color: #000;

    size {
      font-size: calc(var(--size, 32) * 0.5px);
    }
  }
}
</style>
