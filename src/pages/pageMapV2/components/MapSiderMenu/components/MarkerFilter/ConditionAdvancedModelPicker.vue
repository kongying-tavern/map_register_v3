<script lang="ts" setup>
import { useMarkerAdvancedFilterCondition } from './MarkerAdvancedFilterModel'
import { SelectList } from '.'
import { GSButton, GSDivider } from '@/components'

const emits = defineEmits<{
  select: [v: number]
}>()

const modelValue = defineModel<boolean>({
  required: true,
  default: false,
})

const { conditionList } = useMarkerAdvancedFilterCondition()

const selectedId = ref(0)

const handleSelect = () => {
  if (!selectedId.value || selectedId.value <= 0)
    return

  emits('select', selectedId.value)
  selectedId.value = 0
  modelValue.value = false
}

const handleClose = () => {
  selectedId.value = 0
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
    class="custom-dialog hidden-header bg-transparent"
    @closed="handleClose"
  >
    <div class="gs-dark-card flex flex-col overflow-hidden genshin-text">
      <div class="text-xl text-center">
        选择筛选类型
      </div>
      <GSDivider color="#76716A" />
      <el-scrollbar class="flex-1">
        <SelectList
          v-model="selectedId"
          class="h-full overflow-auto"
          :list="conditionList"
          value-key="id"
        >
          <template #icon="{ item }">
            <component :is="item.icon" class="w-[1rem] h-[1rem] self-center mr-2" />
          </template>
          <template #default="{ item }">
            {{ item.name }}
          </template>
        </SelectList>
      </el-scrollbar>

      <GSDivider color="#76716A" />

      <div class="flex gap-4">
        <GSButton
          class="flex-1"
          icon="cancel"
          @click="handleClose"
        >
          取消
        </GSButton>
        <GSButton
          :disabled="!selectedId && selectedId <= 0"
          class="flex-1"
          icon="submit"
          @click="handleSelect"
        >
          使用
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
  width: 400px;
  height: 600px;
  max-width: 100dvw;
  max-height: 100dvh;
}
</style>
