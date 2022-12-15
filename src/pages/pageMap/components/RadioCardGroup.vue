<script lang="ts" setup>
const props = defineProps<{
  modelValue?: string
  itemList: Record<string, any>[]
  dataKey: string
  itemKey?: string
  cancelable?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
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
    class="item-radio-group overflow-y-auto text-xs text-slate-300 p-1"
    @click="proxySelect"
  >
    <div v-if="itemList.length" class="grid grid-cols-3 gap-1 content-start">
      <div
        v-for="item in itemList"
        :key="item[itemKey ?? dataKey]"
        :data-bind-key="item[dataKey]"
        :class="{
          actived: internalBind === item[dataKey],
        }"
        class="item-selector w-full h-10 rounded p-1 flex gap-1 overflow-hidden cursor-pointer transition-all duration-150"
      >
        <slot :item="item" :actived="internalBind === item[dataKey]">
          {{ item[dataKey] }}
        </slot>
      </div>
    </div>
    <slot v-else name="empty">
      <div class="w-full h-full grid place-items-center">
        无内容
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.item-radio-group {
  position: relative;
  scrollbar-width: 10px;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #AA9172;
    border: 1px solid #2F3846;
    border-radius: 2px 4px 4px 2px;
  }
  &::-webkit-scrollbar-track {
    background-color: #2F3846;
  }
}

.item-selector {
  color: #FFF;

  &:hover {
    background-color: rgb(124, 124, 124, 0.5);
  }

  &:active {
    background-color: rgb(124, 124, 124, 0.7);
  }

  &.actived {
    background-color: rgba(35, 35, 35, 0.7);
  }
}
</style>
