<script lang="ts" setup>
import { useIconMap } from '../hooks'

const props = defineProps<{
  modelValue?: number
  itemList: API.ItemVo[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: number): void
}>()

const { iconMap } = useIconMap({
  onSuccess: ({ data }) => {
    console.log('[icon map]', data)
  },
})

const internalBind = computed({
  get: () => props.modelValue,
  set: id => emits('update:modelValue', id),
})

const proxySelect = (ev: MouseEvent) => {
  for (const ele of ev.composedPath()) {
    const itemId = (ele as HTMLElement)?.dataset?.gItemId
    if (itemId === undefined)
      continue
    const parsedId = parseInt(itemId)
    if (props.modelValue === parsedId) {
      internalBind.value = undefined
      return
    }
    internalBind.value = parsedId
  }
}
</script>

<template>
  <div
    class="custom-scrollbar-y w-full overflow-y-auto bg-gray-700 rounded grid grid-cols-5 content-start gap-1 text-xs text-slate-300 p-1"
    @click="proxySelect"
  >
    <div
      v-for="item in itemList"
      :key="item.itemId"
      :data-g-item-id="item.itemId"
      :class="{
        actived: internalBind === item.itemId,
      }"
      class="map-list-item rounded flex flex-col gap-1 items-center cursor-pointer"
    >
      <div class="w-14 h-14 rounded bg-gray-800">
        <img
          :src="iconMap[item.iconTag ?? '']"
          :alt="item.name"
          class="w-full h-full align-middle object-contain"
          decoding="async"
          loading="lazy"
          referrerpolicy="no-referrer"
        >
      </div>
      <span class="w-full align-middle whitespace-nowrap overflow-hidden text-center text-ellipsis">{{ item.name }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-scrollbar-y {
  scrollbar-width: 10px;
  &::-webkit-scrollbar {
    width: 10px;
  }
}

.map-list-item {
  border: 1px solid transparent;
  transition: all ease 100ms;
  padding: 4px;
  width: 100%;

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
