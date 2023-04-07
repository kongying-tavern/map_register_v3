<script lang="ts" setup>
import { contentRefKey, tabNameRefKey } from '.'
import { GSButton } from '@/components'

const props = defineProps<{
  collapse?: boolean
  modelValue?: string
}>()

const emits = defineEmits<{
  (e: 'update:collapse', v?: boolean): void
  (e: 'update:modelValue', v?: string): void
}>()

const contentRef = ref<HTMLElement | null>(null)
provide(contentRefKey, contentRef)

const bindTabName = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})
provide(tabNameRefKey, bindTabName)

const virtualRef = ref<HTMLElement>()
const tooltipContent = ref<string>()
const checkTooltip = (ev: Event) => {
  if (props.collapse) {
    virtualRef.value = undefined
    return
  }
  const findRes = ev.composedPath().find((target) => {
    return target instanceof HTMLElement && target.dataset.tabLabel
  })
  if (!findRes) {
    virtualRef.value = undefined
    return
  }
  virtualRef.value = findRes as HTMLElement
  tooltipContent.value = (findRes as HTMLElement).dataset.tabLabel
}
useEventListener('pointermove', checkTooltip)
useEventListener('pointerdown', checkTooltip)
</script>

<template>
  <div class="sider-menu absolute top-0 left-0 bottom-0 flex" :class="{ 'is-collapse': collapse }">
    <div class="sider-menu-sidebar flex flex-col" :class="{ 'is-collapse': collapse }">
      <div class="w-full aspect-square grid place-items-center transition-all" :class="{ ' -translate-y-full': collapse }">
        <GSButton icon="cancel" @click="$emit('update:collapse', !collapse)" />
      </div>
      <div class="flex-1 flex flex-col justify-center items-center">
        <slot name="default" :collapse="collapse" />
      </div>
    </div>

    <div ref="contentRef" class="sider-menu-extra-panel flex-1" :class="{ 'is-collapse': collapse }" />

    <el-tooltip
      :visible="!collapse && virtualRef !== undefined"
      :virtual-ref="virtualRef"
      :content="tooltipContent"
      :offset="4"
      popper-class="sider-menu-tooltip genshin-text"
      placement="right"
      effect="customized"
      virtual-triggering
    />
  </div>
</template>

<style lang="scss">
.el-popper.is-customized {
  &.sider-menu-tooltip {
    padding: 6px 12px;
    background: #495168;
    color: #ECE5D8;
    font-size: 16px;
  }
  .el-popper__arrow {
    display: none;
  }
}
</style>

<style lang="scss" scoped>
.sider-menu {
  width: 400px;
  max-width: 100%;
  @media screen and (width < 500px) {
    width: 100%;
  }
  &.is-collapse {
    pointer-events: none;
  }
}

.sider-menu-sidebar {
  width: 72px;
  --border-width: 2.5;
  background: paint(map-sidebar);
  transition: all ease 150ms;
  opacity: 1;

  &.is-collapse {
    opacity: 0;
  }
}

.sider-menu-extra-panel {
  background: #263240;
  width: fit-content;
  box-shadow: 4px 0 4px rgb(128 128 128 / 0.2) inset;
  transition: all ease 100ms;
  opacity: 1;
  translate: 0 0;
  clip-path: inset(0 0 0 0);

  &.is-collapse {
    opacity: 0;
    translate: -100% 0;
    clip-path: inset(0 0 0 100%);
  }
}
</style>
