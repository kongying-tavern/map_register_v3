<script lang="ts" setup>
import { useIconList } from '@/hooks'

const props = defineProps<{
  modelValue?: string | string
  itemList: API.ItemVo[]
  iconMap: Record<string, string>
  loading: boolean
  itemKeyName: keyof API.ItemVo
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
    internalBind.value = internalBind.value === itemKey ? undefined : itemKey
  }
}

const { iconMap } = useIconList({
  immediate: false,
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="items-panel overflow-y-auto text-xs text-slate-300 p-1"
    @click="proxySelect"
  >
    <div class="grid grid-cols-3 gap-1 content-start">
      <div
        v-for="item in itemList"
        :key="item.itemId"
        :data-bind-key="item[itemKeyName]"
        :class="{
          actived: internalBind === item[itemKeyName],
        }"
        class="item-selector w-full h-10 rounded p-1 flex gap-1 overflow-hidden cursor-pointer"
      >
        <div class="h-full aspect-square rounded grid place-items-center bg-gray-800">
          <el-image
            :src="iconMap[item.iconTag ?? '']"
            :alt="item.name"
            :title="item.name"
            lazy
            fit="contain"
            decoding="async"
            referrerpolicy="no-referrer"
            class="w-4/5 h-4/5 bg-transparent"
            style="--el-fill-color-light: transparent"
          >
            <template #error>
              <img class="w-full h-full object-contain" src="https://assets.yuanshen.site/icons/-1.png">
            </template>
          </el-image>
        </div>

        <div class="flex-1 align-middle whitespace-nowrap overflow-hidden text-ellipsis leading-7">
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.items-panel {
  position: relative;
  scrollbar-width: 10px;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #AA9172;
    border: 1px solid #2F3846;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    background-color: #2F3846;
  }
}

.item-selector {
  border: 1px solid transparent;
  transition: all ease 176ms;

  &:hover {
    background-color: rgb(124, 124, 124, 0.5);
  }

  &:active {
    background-color: rgb(124, 124, 124, 0.7);
  }

  &.actived {
    background-color: rgba(55, 255, 82, 0.3);
    border-color: rgba(55, 255, 82, 0.6);
  }
}
</style>
