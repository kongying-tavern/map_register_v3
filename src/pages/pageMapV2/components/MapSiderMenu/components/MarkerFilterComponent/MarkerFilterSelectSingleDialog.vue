<script lang="ts" setup>
import { SelectList } from '../SelectList'
import { GSButton, GSDivider, GlobalDialogController } from '@/components'

type ValueType = string | number | null
interface ItemType { [key: string]: ValueType }
type KeyType = keyof ItemType

defineProps<{
  title?: string
  listClass?: string
  list: ItemType[]
  labelKey: KeyType
  valueKey: KeyType
}>()

const isNullable = (v: ValueType): boolean => v === undefined || v === null

const modelValue = defineModel<ValueType>('modelValue', {
  required: false,
  default: null,
})

const confirm = () => {
  if (isNullable(modelValue.value))
    return

  GlobalDialogController.close()
}

const cancel = () => {
  GlobalDialogController.close()
}
</script>

<template>
  <div class="gs-dark-card flex flex-col overflow-hidden genshin-text min-w-[400px]">
    <template v-if="title">
      <div class="text-xl text-center">
        {{ title }}
      </div>
      <GSDivider color="#76716A" />

      <el-scrollbar class="flex-1">
        <SelectList
          v-model="modelValue"
          class="h-full overflow-auto gap-1"
          :class="listClass"
          :list="list"
          :value-key="valueKey"
        >
          <template #default="{ item }">
            {{ item[labelKey] }}
          </template>
        </SelectList>
      </el-scrollbar>

      <GSDivider color="#76716A" />

      <div class="flex gap-4">
        <GSButton
          class="flex-1"
          icon="cancel"
          @click="cancel"
        >
          取消
        </GSButton>
        <GSButton
          :disabled="isNullable(modelValue)"
          class="flex-1"
          icon="submit"
          @click="confirm"
        >
          确认
        </GSButton>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.gs-dark-card {
  padding: 36px 28px;
  background: paint(dark-card-border);
  color: var(--gs-text-color-priamry);
  width: 500px;
  height: 600px;
  max-width: 100dvw;
  max-height: 100dvh;
  @supports not (background: paint(user-card-border)) {
    background: #3E4556;
    border-radius: 24px;
    outline: 6px solid #393E52;
    outline-offset: -6px;
  }
}
</style>
