<script lang="ts" setup>
import { Hide, View } from '@element-plus/icons-vue'
import type { OverlayGroup, OverlayManager } from '../../core'
import { useMap } from '../../hooks'

defineProps<{
  optionGroup: OverlayGroup
}>()

const { map } = useMap()

const getOverlayManager = () => new Promise<OverlayManager>((resolve, reject) => {
  if (!map.value?.baseLayer)
    return reject(new Error('获取底图实例失败'))
  resolve(map.value.baseLayer.overlayManager)
})

const toggleVisible = async (id: string) => {
  const overlayManager = await getOverlayManager()
  overlayManager.toggleVisible(id)
  map.value?.baseLayer?.forceUpdate()
}
</script>

<template>
  <div
    class="gs-overlay-switch"
  >
    <div
      v-for="option in optionGroup.children"
      :key="option.id"
      class="gs-overlay-switch-item"
      @click="() => toggleVisible(option.id)"
    >
      <el-icon
        :size="14"
        :class="[
          option.visible ? 'border-green-600 text-green-600' : 'border-yellow-600',
        ]"
        :color="option.visible ? 'rgb(22 163 74)' : 'rgb(202 138 4)'"
        class="border rounded-full p-0.5"
      >
        <View v-if="option.visible" />
        <Hide v-else />
      </el-icon>
      {{ option.name }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gs-overlay-switch {
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 2px;
}

// TODO hover active actived 以及过渡效果
.gs-overlay-switch-item {
  border: 1px solid rgb(211 188 143);
  background: rgb(236 229 216);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  user-select: none;
}
</style>
