<script setup lang="ts">
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const props = defineProps<{
  label?: string
  note?: string
  icon?: Component
  open?: boolean
}>()

const slots = defineSlots<{
  default: unknown
  setting: unknown
  detail: unknown
  note: unknown
}>()

const collapse = ref(!props.open)
const toggleCollapse = () => {
  if (!slots.detail)
    return
  collapse.value = !collapse.value
}
</script>

<template>
  <div
    class="
      flex flex-col
      bg-[var(--el-fill-color-dark)]
      select-none
      rounded
      overflow-hidden
    "
    @click="toggleCollapse"
  >
    <slot name="default">
      <div
        class="min-h-[66px] flex flex-shrink-0 items-center px-4 py-3"
        :class="$slots.detail ? 'hover:bg-[var(--el-fill-color-darker)] active:bg-[var(--el-fill-color)]' : ''"
      >
        <div class="flex-1 flex items-center">
          <div v-if="icon" class="row-span-2 grid place-items-center pr-4">
            <el-icon :size="20">
              <component :is="icon" />
            </el-icon>
          </div>

          <div class="flex flex-col">
            <div v-if="label" class="text-[var(--el-text-color-primary)]">
              {{ label }}
            </div>
            <slot name="note">
              <div v-if="note" class="text-xs text-[var(--el-text-color-regular)]">
                {{ note }}
              </div>
            </slot>
          </div>
        </div>

        <slot name="setting" />

        <div v-if="$slots.detail" class="pl-4 flex items-center">
          <el-icon :size="14">
            <ArrowDown v-if="collapse" />
            <ArrowUp v-else />
          </el-icon>
        </div>
      </div>
    </slot>

    <div v-if="$slots.detail" v-show="!collapse" class="flex flex-col">
      <div class="w-full h-[1px] bg-[var(--el-bg-color)]" />
      <div class="p-4 pb-6">
        <slot name="detail" />
      </div>
    </div>
  </div>
</template>
