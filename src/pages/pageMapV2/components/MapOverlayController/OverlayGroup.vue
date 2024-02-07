<script lang="ts" setup>
import type { OverlayControlGroup } from '@/stores'
import { useOverlayStore } from '@/stores'
import { GSSwitch } from '@/components'

const props = defineProps<{
  data: OverlayControlGroup
}>()

const overlayStore = useOverlayStore()

const isShow = computed({
  get: () => !overlayStore.hiddenOverlayGroups.has(props.data.id),
  set: v => overlayStore[v ? 'showOverlayGroup' : 'hideOverlayGroup'](props.data.id),
})
</script>

<template>
  <div class="overlay-group flex flex-col gap-2 rounded-[10px] p-2 m-[6px] bg-[#00000040]">
    <div class="flex justify-between text-[#D3BC8E]">
      <div class="flex-1">
        {{ data.name }}
      </div>
      <GSSwitch v-model="isShow" size="small" @click.stop="" />
    </div>

    <div
      class="grid grid-cols-2 gap-2 transition-all"
      :class="{
        'opacity-[20%]': !isShow,
      }"
    >
      <div
        v-for="item in data.items"
        :key="item.id"
        class="overlay-item border p-1 border-gray-500 rounded-md text-sm grid place-items-center"
        :class="{
          'is-top': item.id === overlayStore.topOverlayInGroup[data.id],
        }"
        @click="() => overlayStore.moveToTop(item.id, data.id)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.overlay-group {
  transition: all ease 150ms;
}

.overlay-item {
  color: gray;
  min-height: 4em;
  transition: all ease 150ms;
  position: relative;

  &.is-top {
    border-color: #1CFFFF;
    color: #1CFFFF;
  }

  &:not(.is-top) {
    cursor: pointer;
  }

  &:not(.is-top):hover {
    background-color: #1CFFFF40;
  }

  &:not(.is-top):active {
    background-color: #1CFFFF20;
  }
}
</style>
