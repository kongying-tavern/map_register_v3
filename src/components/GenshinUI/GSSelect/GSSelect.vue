<script setup lang="ts" generic="T, LK extends keyof T, VK extends keyof T">
import { Select } from '@element-plus/icons-vue'

const props = defineProps<{
  options: T[]
  labelKey: LK
  valueKey: VK
  placeholder?: string
  getDisabled?: (option: T) => boolean
  /** 是否禁用选择选项后自动隐藏选项列表 */
  disabledAutoHidden?: boolean
}>()

const emits = defineEmits<{
  change: [value: T[VK]]
  dropdownVisibleChange: [boolean]
}>()

const dropdownVisible = ref(false)
const listRef = ref<HTMLElement>()
const labelRef = ref<HTMLElement>()

useEventListener('pointerdown', (ev) => {
  if (!dropdownVisible.value)
    return
  const hasTarget = ev.composedPath().find((target) => {
    return (target === labelRef.value) || (target === listRef.value)
  })
  if (hasTarget)
    return
  dropdownVisible.value = false
  emits('dropdownVisibleChange', false)
})

const openOptionList = () => {
  dropdownVisible.value = !dropdownVisible.value
  emits('dropdownVisibleChange', dropdownVisible.value)
}

const itemMap = computed(() => props.options.reduce((map, item) => {
  return map.set(item[props.valueKey as string], item)
}, new Map<VK, T>()))

const nameMap = computed(() => props.options.reduce((map, item) => {
  return map.set(item[props.valueKey as string], item[props.labelKey as string])
}, new Map<VK, LK>()))

const modelValue = defineModel<T[VK]>('modelValue', {
  required: false,
  default: undefined,
})

const selectValue = (option: T) => {
  const { disabledAutoHidden = false, valueKey, getDisabled } = props
  const isDisabled = getDisabled ? getDisabled(option) : false
  if (isDisabled)
    return
  const value = option[valueKey as string]
  modelValue.value = value
  emits('change', value)
  if (disabledAutoHidden)
    return
  dropdownVisible.value = false
  emits('dropdownVisibleChange', false)
}
</script>

<template>
  <div class="gs-select gs-select-variable">
    <div ref="labelRef" class="label-content" @click="openOptionList">
      <slot
        v-if="nameMap.get(modelValue as VK)"
        name="label"
        :label="itemMap.get(modelValue as VK)?.[labelKey as string]"
        :value="itemMap.get(modelValue as VK)?.[valueKey as string]"
        :option="itemMap.get(modelValue as VK)"
        :dropdown-visible
      >
        {{ nameMap.get(modelValue as VK) }}
      </slot>

      <slot
        v-else
        name="missed"
        :value="modelValue"
      >
        {{ modelValue }}
      </slot>
    </div>

    <div
      ref="listRef"
      class="option-list"
      :class="{
        'is-visible': dropdownVisible,
      }"
    >
      <el-scrollbar height="100%">
        <div
          v-for="option in options"
          :key="`${option[valueKey as string]}`"
          class="option"
          :class="{
            'is-active': option[valueKey as string] === modelValue,
          }"
          @click="() => selectValue(option)"
        >
          <slot
            name="default"
            :label="option[labelKey as string]"
            :value="option[valueKey as string]"
            :option="option"
          >
            <div class="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
              {{ option[labelKey as string] }}
            </div>
          </slot>

          <el-icon v-if="option[valueKey as string] === modelValue" class="absolute right-0 top-0">
            <Select />
          </el-icon>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<style scoped>
.gs-select-variable {
  --align: left;
  --height: 32px;
  --radius: calc(3px + var(--height) / 2);
}

.gs-select {
  position: relative;
  height: var(--height);
  display: flex;
  align-items: center;
}

.label-content {
  --active-opacity: 0;

  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #C9BEAD;
  color: #4B5467;
  height: var(--height);
  line-height: calc(var(--height) - 8px);
  padding: 4px 10px;
  border-radius: calc(3px + var(--height) / 2);
  cursor: pointer;
  text-align: var(--align);
  position: relative;

  &::before {
    content: '';
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(#FFF8C0, transparent);
    opacity: var(--active-opacity);
    z-index: -1;
  }

  &:hover {
    outline: 2px solid white;
    filter: brightness(1.05);
  }

  &:active {
    --active-opacity: 1;
  }
}

.option-list {
  border-radius: var(--radius);
  position: absolute;
  padding: 3px;
  z-index: 10;
  top: 100%;
  left: 0;
  width: 100%;
  height: 240px;
  background: #495366;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity ease 150ms;

  &.is-visible {
    opacity: 1;
    pointer-events: auto;
  }
}

.option {
  --bg: transparent;
  --sc: 0.98 0.95;
  --color: #ECE5D8;

  position: relative;
  padding: 4px 10px;
  height: var(--height);
  border-radius: var(--radius);
  color: var(--color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  text-align: var(--align);

  &::before {
    border-radius: var(--radius);
    pointer-events: none;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg);
    scale: var(--sc);
    transition: all ease-out 100ms;
    z-index: -1;
  }

  &.is-active {
    --bg: #ECE5D830;
  }

  &:hover {
    --sc: 1 1;
    --bg: #ECE5D830;
  }

  &:active {
    --color: #495366;
    --bg: #ECE5D8;
  }
}
</style>
