<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import ToolbarItem from './ToolbarItem.vue'

const props = withDefaults(defineProps<{
  basesize?: number
  editor: Editor
}>(), {
  basesize: 32,
})

const setColor = (value: string, done: () => void) => {
  props.editor.chain().focus().setColor(value).run()
  done()
}

const size = controlledRef<number>(props.basesize, {
  onBeforeChange: (value) => {
    if (Number.isNaN(Number(value)))
      return false
    return true
  },
  onChanged: (value) => {
    return Number(value)
  },
})

const isInternalChange = ref(false)

watch(() => props.editor.getAttributes('size').size, (newSize) => {
  if (!newSize) {
    size.value = props.basesize
    return
  }
  size.value = Number(newSize)
})

const setSize = (value: number) => {
  isInternalChange.value = true
  props.editor.chain().focus().setSize(value).run()
}

const colorList: string[] = [
  '#FFFFFF',
  '#000000',
  '#E7E6E6',
  '#44546A',
  '#4472C4',
  '#ED7D31',
  '#A5A5A5',
  '#FFC000',
  '#5B9BD5',
  '#70AD47',
]

const sizeAliasList = [
  { level: 1, size: 21 },
  { level: 2, size: 17 },
]
</script>

<template>
  <div class="header-toolbar">
    <ToolbarItem plain title="字号">
      <el-input v-model="size" style="width: 60px" @blur="() => setSize(size)" />
    </ToolbarItem>

    <ToolbarItem title="加粗" class="text-xl" :is-active="editor.isActive('bold')" @click="editor.commands.toggleBold">
      B
    </ToolbarItem>

    <ToolbarItem title="斜体" :is-active="editor.isActive('italic')" @click="editor.commands.toggleItalic">
      <span class="italic font-mono text-xl">
        I
      </span>
    </ToolbarItem>

    <ToolbarItem
      title="字体颜色"
      :style="{ '--color': editor.getAttributes('color').color || 'var(--el-text-color-primary)' }"
    >
      <template #default>
        <div class="w-full h-full flex flex-col">
          <div class="flex-1 flex justify-center items-end text-xl leading-none">
            A
          </div>
          <div class="w-full h-2 bg-[var(--color)] bg-clip-content px-[5px] pb-1" />
        </div>
      </template>
      <template #dropdown="{ close }">
        <div
          class="bg-[var(--el-bg-color)] flex flex-col text-xs rounded p-2 px-3"
          style="box-shadow: var(--el-box-shadow-light)"
        >
          <div class="text-[var(--el-text-color-primary)] pb-2 px-1 font-bold">
            字体颜色
          </div>
          <div
            class="
              h-6 p-1 flex gap-2 cursor-pointer
              text-[var(--el-text-color-primary)]
              hover:bg-[var(--el-color-info-light-7)]
              active:bg-[var(--el-color-info-light-5)]
            "
            title="颜色: 自动"
            @click="() => setColor('', close)"
          >
            <div
              class="w-4 h-full outline outline-[1px] outline-gray-500 outline-offset-[-1px]"
              style="background-color: var(--el-text-color-primary)"
            />
            自动
          </div>
          <div class="w-full h-[1px] bg-[var(--el-border-color-darker)] my-2" />
          <div class="flex">
            <div
              v-for="color in colorList"
              :key="color"
              :title="`颜色: ${color}`"
              class="
                w-6 h-6 p-1 cursor-pointer
                hover:bg-[var(--el-color-info-light-7)]
                active:bg-[var(--el-color-info-light-5)]
                outline outline-[1px] outline-[var(--el-border-color)] outline-offset-[-5px]
              "
              @click="() => setColor(color, close)"
            >
              <div
                class="w-full h-full"
                :style="`background-color: ${color}`"
              />
            </div>
          </div>
          <div class="w-full h-[1px] bg-[var(--el-border-color-darker)] my-2" />
          <div class="flex gap-2 text-[var(--el-text-color-primary)]">
            <input
              title="颜色: 自定义"
              class="color-picker cursor-pointer outline outline-[1px] outline-[var(--el-border-color)] outline-offset-[-1px]"
              type="color"
              @input="(ev) => setColor((ev.target as HTMLInputElement).value, close)"
            >
            自定义
          </div>
        </div>
      </template>
    </ToolbarItem>

    <ToolbarItem
      v-for="sizeAlias in sizeAliasList"
      :key="sizeAlias.level"
      @click="() => setSize(sizeAlias.size)"
    >
      <span class="font-bold text-base">H<sub class="inline-block scale-[0.9]">{{ sizeAlias.level }}</sub></span>
    </ToolbarItem>
  </div>
</template>

<style scoped>
.header-toolbar {
  display: flex;
  background-color: var(--el-fill-color-light);
  gap: 4px;
  padding: 8px;
}

/* 临时用，后期改为 vue 组件 */
.color-picker {
  height: 16px;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
  }
}
</style>
