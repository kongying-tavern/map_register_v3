<script lang="ts" setup>
import type { AnyObject } from '@/shared'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  itemList: AnyObject[]
  dataKey: string
  itemKey?: string
  cancelable?: boolean
  cols?: 1 | 2 | 3
}>(), {
  cols: 2,
})

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string | number): void
}>()

const internalBind = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})

/** 通过事件委托选择 item，降低 DOM 上监听器的注册数量 */
const proxySelect = (ev: MouseEvent) => {
  for (const ele of ev.composedPath()) {
    const itemKey = (ele as HTMLElement)?.dataset?.bindKey
    if (itemKey === undefined)
      continue
    internalBind.value = internalBind.value === itemKey
      ? props.cancelable
        ? undefined
        : itemKey
      : itemKey
  }
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="item-radio-group genshin-text text-xs overflow-hidden"
    @click="proxySelect"
  >
    <el-scrollbar v-if="itemList.length">
      <div
        class="grid gap-1 content-start"
        :class="{
          'grid-cols-1': cols === 1,
          'grid-cols-2': cols === 2,
          'grid-cols-3': cols === 3,
        }"
      >
        <div
          v-for="item in itemList"
          :key="item[itemKey ?? dataKey]"
          :data-bind-key="item[dataKey]"
          :class="{
            actived: `${internalBind}` === `${item[dataKey]}`,
          }"
          class="item-selector w-full h-10 rounded-md flex items-center overflow-hidden cursor-pointer transition-all duration-150"
        >
          <slot :item="item" :actived="`${internalBind}` === `${item[dataKey]}`">
            {{ item[dataKey] }}
          </slot>
        </div>
      </div>
    </el-scrollbar>

    <slot v-else name="empty">
      <div class="w-full h-full grid place-items-center">
        无内容
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.item-radio-group {
  color: rgba(144 147 153 / 0.8);
}

.item-selector {
  border: 1px solid rgba(164, 165, 168, 0.2);
  padding: 1px;
  color: rgb(255 255 255 / 0.8);

  &:hover {
    background-color: rgb(0 0 0 / 0.2);
    border-color: transparent;
  }

  &:active {
    background-color: rgb(0 0 0 / 0.3);
  }

  &.actived {
    background-color: rgb(0 0 0 / 0.5);
    border-color: rgb(144 147 153 / 0.8);
  }
}
</style>
