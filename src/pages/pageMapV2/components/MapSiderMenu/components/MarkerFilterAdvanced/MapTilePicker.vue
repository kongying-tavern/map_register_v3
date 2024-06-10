<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { SelectList } from '../SelectList'
import { GSButton, GSDivider } from '@/components'
import { usePreferenceStore, useTileStore } from '@/stores'

const emits = defineEmits<{
  select: [v?: string]
}>()

const modelValue = defineModel<boolean>('modelValue', {
  required: true,
  default: false,
})

const { preference } = storeToRefs(usePreferenceStore())
const { currentTileCode, mapTileOptions } = storeToRefs(useTileStore())

const selectedValue = ref<string>('')

const open = () => {
  const currentTileOption = mapTileOptions.value.find(v => v.tile.code === currentTileCode.value)
  selectedValue.value = currentTileOption?.code ?? ''
}

const confirm = () => {
  preference.value['markerFilter.state.areaCode'] = selectedValue.value
  emits('select', selectedValue.value)
  selectedValue.value = ''
  modelValue.value = false
}

const cancel = () => {
  selectedValue.value = ''
  modelValue.value = false
}
</script>

<template>
  <el-dialog
    v-model="modelValue"
    :show-close="false"
    :close-on-click-modal="false"
    append-to-body
    align-center
    width="fit-content"
    class="custom-dialog hidden-header bg-transparent min-w-[500px]"
    @open="open()"
  >
    <div class="gs-dark-card flex flex-col overflow-hidden genshin-text">
      <div class="text-xl text-center">
        选择地图
      </div>
      <GSDivider color="#76716A" />

      <el-scrollbar class="flex-1">
        <SelectList
          v-model="selectedValue"
          :list="mapTileOptions"
          class="grid grid-cols-2"
          value-key="code"
        >
          <template #default="{ item }">
            {{ item.tile.name }}
          </template>
        </SelectList>
      </el-scrollbar>

      <GSDivider color="#76716A" />

      <div class="flex gap-4">
        <GSButton
          class="flex-1"
          icon="cancel"
          @click="cancel()"
        >
          取消
        </GSButton>
        <GSButton
          class="flex-1"
          :disabled="!selectedValue"
          icon="submit"
          @click="confirm()"
        >
          切换
        </GSButton>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.gs-dark-card {
  padding: 36px 28px;
  background: paint(dark-card-border);
  color: var(--gs-text-color-priamry);
  @supports not (background: paint(user-card-border)) {
    background: #3E4556;
    border-radius: 24px;
    outline: 6px solid #393E52;
    outline-offset: -6px;
  }
}
</style>