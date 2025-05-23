<script lang="ts" setup>
import { GSButton, GSDivider } from '@/components'
import { SelectList } from '../SelectList'

type ValueType = string | number
interface ItemType { [key: string]: ValueType }
type KeyType = string

defineProps<{
  title?: string
  listClass?: string
  list: ItemType[]
  labelKey: KeyType
  valueKey: KeyType
}>()

const emits = defineEmits<{
  'update:modelValue': [v: ValueType[]]
  'confirm': [v: ValueType[]]
  'cancel': []
}>()

const modelValue = defineModel<ValueType[]>('modelValue', {
  required: false,
  default: [],
})

const confirm = () => {
  emits('confirm', modelValue.value)
}

const cancel = () => {
  emits('cancel')
}
</script>

<template>
  <div class="genshin-dark-card flex flex-col overflow-hidden font-['HYWenHei-85W'] min-w-[400px] w-[500px] h-[600px] max-w-[100dvw] max-h-[100dvh]">
    <template v-if="title">
      <div class="text-xl text-center">
        {{ title }}
      </div>
      <GSDivider color="#76716A" :height="34" />

      <template v-if="$slots.list">
        <slot
          name="list"
          v-bind="{ modelValue, listClass, list, labelKey, valueKey }"
          @update:model-value="(v) => emits('update:modelValue', v)"
        />
      </template>
      <template v-else>
        <el-scrollbar class="flex-1">
          <SelectList
            v-model="modelValue"
            class="h-full overflow-auto gap-1"
            :multiple="true"
            :class="listClass"
            :list="list"
            :value-key="valueKey"
          >
            <template #default="{ item }">
              {{ item[labelKey] }}
            </template>
          </SelectList>
        </el-scrollbar>
      </template>

      <GSDivider color="#76716A" :height="34" />

      <div class="flex gap-4">
        <GSButton
          class="flex-1"
          icon="cancel"
          @click="cancel"
        >
          取消
        </GSButton>
        <GSButton
          :disabled="modelValue.length <= 0"
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
