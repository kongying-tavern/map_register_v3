<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'

defineProps<{
  isActive?: boolean
  plain?: boolean
  name?: string
}>()

const dropdownVisible = ref(false)

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

const closeDropdown = () => {
  dropdownVisible.value = false
}

const dropdownArrowRef = ref<HTMLElement>()

const dropdownRef = ref<HTMLElement>()
onClickOutside(dropdownRef, (ev) => {
  if (ev.composedPath().find(el => el === dropdownArrowRef.value))
    return
  closeDropdown()
})
</script>

<template>
  <div
    class="tool-item"
    :class="{
      'has-dropdown': Boolean($slots.dropdown),
      'is-active': isActive,
      plain,
    }"
  >
    <div class="item-content">
      <div class="flex-1 w-full grid place-items-center">
        <slot name="default" />
      </div>
      <div v-if="name" class="item-name">
        {{ name }}
      </div>
    </div>

    <div v-if="$slots.dropdown" ref="dropdownArrowRef" class="item-dropdown-icon" @click="toggleDropdown">
      <el-icon
        class="scale-90 transition-all"
        :size="12"
        :class="dropdownVisible ? 'rotate-180' : ''"
        color="var(--el-text-color-regular)"
      >
        <ArrowDown />
      </el-icon>
    </div>

    <div v-if="dropdownVisible" ref="dropdownRef" class="item-dropdown-content">
      <slot name="dropdown" :close="closeDropdown" />
    </div>
  </div>
</template>

<style scoped>
.tool-item {
  --cursor: auto;
  --hover-bg: transparent;
  --active-bg: transparent;
  --radius: 4px;
  --content-radius: var(--radius) var(--radius) var(--radius) var(--radius);

  height: 32px;
  display: flex;
  transition: all ease 150ms;
  color: var(--el-color-info-light-3);
  user-select: none;
  line-height: 1;
  position: relative;
  overflow: visible;

  &.is-active {
    color: var(--el-color-primary);
  }

  &.has-dropdown {
    --content-radius: 4px 0 0 4px;
  }

  &:not(.plain) {
    --cursor: pointer;
    --hover-bg: var(--el-fill-color-dark);
    --active-bg: var(--el-fill-color-darker);
  }
}

.item-content {
  cursor: var(--cursor);
  min-width: 32px;
  display: flex;
  flex-direction: column;
  border-radius: var(--content-radius);

  &:hover {
    background-color: var(--hover-bg);
  }
  &:active {
    background-color: var(--active-bg);
  }
}

.item-name {
  font-size: 12px;
  scale: 0.8;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-dropdown-icon {
  cursor: pointer;
  width: 14px;
  overflow: visible;
  display: grid;
  place-items: center;
  border-radius: 0 var(--radius) var(--radius) 0;

  &:hover {
    background-color: var(--hover-bg);
  }
  &:active {
    background-color: var(--active-bg);
  }
}

.item-dropdown-content {
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 1;
  translate: 0;
}
</style>
