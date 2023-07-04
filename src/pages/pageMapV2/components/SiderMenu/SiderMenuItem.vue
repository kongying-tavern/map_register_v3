<script lang="ts" setup>
import { Grid } from '@element-plus/icons-vue'
import { contentRefKey, tabNameRefKey } from '.'

const props = defineProps<{
  label?: string
  name?: string
  icon?: Component
}>()

const emits = defineEmits<{
  (e: 'click', v: MouseEvent): void
}>()

const contentRef = inject(contentRefKey, ref(null))
const tabNameRef = inject(tabNameRefKey, ref())

const actived = computed(() => tabNameRef.value === props.name)

const activeTab = (ev: MouseEvent) => {
  emits('click', ev)
  if (!props.name)
    return
  tabNameRef.value = props.name
}
</script>

<template>
  <div class="sider-menu-tab" :class="{ actived }" :data-tab-label="label" @click="ev => activeTab(ev)">
    <slot name="tab">
      <div class="sider-menu-tab-button">
        <slot name="icon">
          <component :is="icon ?? Grid" style="color: var(--icon-color)" />
        </slot>
      </div>
    </slot>
  </div>

  <Teleport v-if="contentRef && tabNameRef === name" :to="contentRef">
    <slot name="default" />
  </Teleport>
</template>

<style lang="scss" scoped>
.sider-menu-tab {
  --icon-color: #D3BC8E;
  --scale: 1;
  --button-bg: transparent;

  width: 72px;
  height: 72px;
  padding: 12px;

  &:hover {
    --scale: 1.1;
    --button-bg: #3B4554;
    --icon-color: #ECE5D8;
  }
  &:active, &.actived {
    --button-bg: #ECE5D8;
    --icon-color: #3B4255;
  }
}

.sider-menu-tab-button {
  width: 100%;
  height: 100%;
  padding: 5px;
  scale: var(--scale);
  border-radius: 50%;
  background: var(--button-bg);
  transition: all ease 150ms;
}
</style>
