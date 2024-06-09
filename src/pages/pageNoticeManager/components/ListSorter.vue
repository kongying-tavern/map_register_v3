<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

defineProps<{
  options: { label: string; key: string }[]
}>()

const modelValue = defineModel<string[]>('modelValue', {
  required: false,
  default: () => [],
})

const vvv = ref<boolean[]>([])

const selectedSortKey = ref<string>('')
const isAddMode = ref(true)

const selectSortKey = (key: string, isAdding = false) => {
  selectedSortKey.value = key
  isAddMode.value = isAdding
}
</script>

<template>
  <div class="p-2 flex flex-col gap-2">
    <div class="flex">
      <div class="w-40 h-52 border rounded overflow-auto">
        <div
          v-for="option in options"
          :key="option.key"
          :class="{
            'is-actived': isAddMode && option.key === selectedSortKey,
          }"
          class="sorter-item"
          @click="() => selectSortKey(option.key, true)"
        >
          {{ option.label }}
        </div>
      </div>

      <div class="h-52 grid place-items-center place-content-center px-2 gap-2">
        <div>
          <el-button :disabled="!isAddMode || !selectedSortKey" size="small" :icon="ArrowRight" style="padding: 4px 6px" />
        </div>
        <div>
          <el-button :disabled="isAddMode || !selectedSortKey" size="small" :icon="ArrowLeft" style="padding: 4px 6px" />
        </div>
      </div>

      <div class="w-44 h-52 border rounded overflow-auto">
        <div
          v-for="(option, index) in options"
          :key="option.key"
          :class="{
            'is-actived': !isAddMode && option.key === selectedSortKey,
          }"
          class="sorter-item justify-between"
          @click="() => selectSortKey(option.key)"
        >
          <div>
            {{ index + 1 }} {{ option.label }}
          </div>
          <div>
            <el-switch v-model="vvv[index]" size="small" inline-prompt active-text="升序" inactive-text="降序" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <el-button size="small" type="primary">
        确认
      </el-button>
      <el-button size="small">
        取消
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.sorter-item {
  transition: all ease 150ms;
  user-select: none;
  cursor: pointer;
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 4px;

  &:hover {
    background: var(--el-fill-color-light);
  }
  &:active {
    background: var(--el-fill-color);
  }

  &.is-actived {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
</style>
