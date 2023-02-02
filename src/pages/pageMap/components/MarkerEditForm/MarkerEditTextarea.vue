<script lang="ts" setup>
import { Setting } from '@element-plus/icons-vue'
import type { InputInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { TeleportExtra } from '.'

const props = defineProps<{
  modelValue?: string
  extraId: string
  name: string
  description?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
  (e: 'update:extraId', v: string): void
}>()

const internalBind = computed({
  get: () => props.modelValue ?? '',
  set: v => emits('update:modelValue', v),
})

const extraActive = computed(() => props.extraId === props.name)

const toggleExtraPanel = () => {
  emits('update:extraId', extraActive.value ? '' : props.name)
}

const inputRef = ref<InputInstance | null>(null)

const selectionStart = ref<number>()
const selectionEnd = ref<number>()
// TODO 这里的选区信息只在需要点击填充标签的时候需要，在离开输入区点击其他组件时必然会触发 blur 事件，理论上只需要注册 onblur 事件就行了
const updateSelectionState = (ev: Event) => {
  const target = ev.target as HTMLTextAreaElement
  selectionStart.value = target.selectionStart
  selectionEnd.value = target.selectionEnd
}

const characters = ['「', '」', '《', '》', '【', '】', ' · ', '…', '×']

const insertChar = async (char: string) => {
  let start = selectionStart.value
  let end = selectionEnd.value
  if (start === undefined || end === undefined) {
    ElMessage.warning('未记录到光标位置，请选择想要插入到的文本位置')
    return
  }
  const charArray = internalBind.value?.split('')
  charArray.splice(start, end - start, char)
  internalBind.value = charArray.join('')
  start += char.length
  end = start
  await inputRef.value?.focus()
  inputRef.value?.textarea?.setSelectionRange(start, end)
}
</script>

<template>
  <div class="w-full flex justify-between items-start gap-1">
    <el-input
      v-model="internalBind"
      type="textarea"
      resize="none"
      :rows="3"
      @blur="updateSelectionState"
    />

    <el-button :icon="Setting" :type="extraActive ? 'primary' : ''" :title="description" circle @click="toggleExtraPanel" />

    <TeleportExtra :active="extraActive">
      <div class="flex flex-col gap-2">
        <div class="flex">
          快捷标点：
          <el-button-group size="small">
            <el-button v-for="c in characters" :key="c" @click="() => insertChar(c)">
              {{ c }}
            </el-button>
          </el-button-group>
        </div>
        <el-input ref="inputRef" v-model="internalBind" type="textarea" resize="none" :rows="20" @blur="updateSelectionState" />
      </div>
    </TeleportExtra>
  </div>
</template>
