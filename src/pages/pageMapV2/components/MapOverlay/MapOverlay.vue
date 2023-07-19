<script lang="ts" setup>
import { Hide, View } from '@element-plus/icons-vue'
import type { OverlayGroup, OverlayManager } from '../../core'
import { useMap } from '../../hooks'

const props = defineProps<{
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

const width = computed(() => {
  const { 0: xmin, 2: xmax } = props.optionGroup.bounds
  return `${xmax - xmin}px`
})

const height = computed(() => {
  const { 1: ymin, 3: ymax } = props.optionGroup.bounds
  return `${ymax - ymin}px`
})
</script>

<template>
  <div class="gs-overlay-switch">
    <div class="gs-overlay-switch-wrapper">
      <div
        v-for="option in optionGroup.children"
        :key="option.id"
        class="gs-overlay-switch-item"
        @click="() => toggleVisible(option.id)"
      >
        <el-icon
          :size="48"
          :class="[
            option.visible ? 'border-green-600 text-green-600' : 'border-yellow-600',
          ]"
          :color="option.visible ? 'rgb(22 163 74)' : 'rgb(202 138 4)'"
          class="border rounded-full p-0.5 mr-2"
        >
          <View v-if="option.visible" />
          <Hide v-else />
        </el-icon>
        {{ option.name }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gs-overlay-switch {
  --bounds-color: transparent;

  position: relative;
  pointer-events: none;

  &:hover {
    --bounds-color: red;
  }

  &::before {
    content: '';
    position: absolute;
    width: v-bind(width);
    height: v-bind(height);
    left: 0;
    top: 0;
    pointer-events: none;
    border: 2px solid var(--bounds-color);
  }
}

.gs-overlay-switch-wrapper {
  pointer-events: all;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: absolute;
  left: 0;
  top: 0;
  width: fit-content;
  translate: v-bind(width) v-bind(height);
}

// TODO hover active actived 以及过渡效果
.gs-overlay-switch-item {
  border: 1px solid rgb(211 188 143);
  background: rgb(236 229 216);
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 24px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  gap: 2px;
  cursor: pointer;
  user-select: none;

  font-family: 'MHYG';
}
</style>
