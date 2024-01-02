<script lang="ts" setup>
import { RefreshLeft } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { OverlayGroup } from '.'
import { useAreaStore, useOverlayStore } from '@/stores'

const overlayStore = useOverlayStore()

const { areaCodeMap } = storeToRefs(useAreaStore())

/** 按地区分组的 overlay 控制组 */
const overlayControlGroupsListedInArea = computed(() => {
  return Object.entries(overlayStore.overlayControlGroups).reduce((seed, [_, overlayGroup]) => {
    const { areaCode } = overlayGroup
    const topAreaCode = areaCode.startsWith('A:') ? `C:${areaCode.split(':')[1]}` : areaCode
    if (!seed[topAreaCode])
      seed[topAreaCode] = []
    seed[topAreaCode].push(overlayGroup)
    return seed
  }, {} as Record<string, (typeof overlayStore.overlayControlGroups)[string][]>)
})

const activedAreaCode = ref<string>('')
watch(overlayControlGroupsListedInArea, (groups) => {
  activedAreaCode.value = Object.keys(groups)[0]
}, { immediate: true })
</script>

<template>
  <div class="overlay-control-panel genshin-text">
    <div class="p-2 flex items-center justify-between text-xl bg-[#2b3949] text-[#AE9F80]">
      <div class="flex-1 flex items-center gap-2">
        附加图层
        <el-icon
          class="cursor-pointer hover:brightness-90 active:brightness-50 transition-all"
          :size="24"
          title="重置图层置顶状态"
          @click="() => overlayStore.initTopOverlays(true)"
        >
          <RefreshLeft />
        </el-icon>
      </div>
    </div>

    <div class="sidermenu flex-1 flex text-white overflow-hidden bg-[#2b3949]">
      <div class="flex flex-col">
        <div
          v-for="(_, areaCode) in overlayControlGroupsListedInArea"
          :key="areaCode"
          class="sidermenu-item"
          :class="{
            'is-actived': areaCode === activedAreaCode,
          }"
          @click="activedAreaCode = areaCode"
        >
          {{ areaCodeMap.get(areaCode)?.name }}
        </div>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden bg-[#1b242e]">
        <div v-if="!Object.keys(overlayControlGroupsListedInArea).length" class="w-full h-full grid place-items-center">
          当前地图没有可用的附加图层
        </div>
        <el-scrollbar v-else>
          <OverlayGroup
            v-for="overlayGroup in overlayControlGroupsListedInArea[activedAreaCode]"
            :key="overlayGroup.id"
            :data="overlayGroup"
          />
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.overlay-control-panel {
  overflow: hidden;
  width: 400px;
  height: 80dvh;
  max-width: calc(100dvw - 48px);
  background-color: var(--bg);
  border-radius: 6px;
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: 0;
  right: 0;
}

.sidermenu-item {
  width: 80px;
  height: 40px;
  display: grid;
  place-items: center;
  transition: all ease 150ms;

  &.is-actived {
    background-color: #AE9F80;
    color: #2b3949;
  }

  &:not(.is-actived) {
    cursor: pointer;
  }

  &:not(.is-actived):hover {
    background-color: #FFFFFF20;
  }

  &:not(.is-actived):active {
    background-color: #00000020;
  }
}
</style>
