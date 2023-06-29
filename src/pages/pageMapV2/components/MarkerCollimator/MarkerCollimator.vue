<script lang="ts" setup>
import { Plus } from '@element-plus/icons-vue'
import { useInteractionLayer, useMapProjection, useMarkerCollimator } from '../../hooks'
import { mutuallyExclusiveLayerKey } from '../../shared'
import type { Coordinate2D } from '../../core'
import { usePositionCreate, usePositionEdit } from './hooks'
import { GSButton } from '@/components'

const mutuallyExclusiveLayerRef = inject(mutuallyExclusiveLayerKey, ref(null))

const { collimatorVisible, collimatorEditMode, hook, target, cancel, confirm } = useMarkerCollimator()

/** 点位原始缓存坐标 */
const cacheStartCoord = ref<Coordinate2D>()

const { position } = useMapProjection(cacheStartCoord)
const { top: viewTop, x: viewX, y: viewY, width: viewWidth, height: viewHeight } = useElementBounding(mutuallyExclusiveLayerRef)

/** 视口元素的中心点位置 */
const viewCenter = computed<Coordinate2D>(() => [viewX.value + viewWidth.value / 2, viewY.value - viewTop.value + viewHeight.value / 2])

/** 点位和中心点连线所需的宽 */
const width = computed(() => position.value[0] - viewCenter.value[0])

/** 点位和中心点连线所需的高 */
const height = computed(() => position.value[1] - viewCenter.value[1])

/** 定位视口到特定的坐标 */
hook.open((coord) => {
  cacheStartCoord.value = coord
  collimatorEditMode.value = Boolean(coord)
})

usePositionCreate()
usePositionEdit()

/** 点位坐标瞄准器与交互层互斥显示 */
const { visible: interactionVisible } = useInteractionLayer()
watch(collimatorVisible, (visible) => {
  interactionVisible.value = !visible
  !visible && (collimatorEditMode.value = false)
})

interface SwitchClassOptions<T> {
  activeValue: T
  inactiveValue: T
  startValue?: T
}

/**
 * @todo 基于 CSS3 的新版选择器方案可能可以直接不需要这个 hook，但是还未想到如何实现
 * 初始态为空，便于区分 "初始无动画状态" 与 "显示有动画状态"
 */
const useSwitchClass = (switchValue: Ref<boolean>, options: SwitchClassOptions<string>) => {
  const { activeValue, inactiveValue, startValue = switchValue ? activeValue : inactiveValue } = options

  const rawValue = ref(startValue)

  watch(switchValue, (bool) => {
    rawValue.value = bool ? activeValue : inactiveValue
  })

  return rawValue
}

const creatorPanelClassname = useSwitchClass(collimatorVisible, {
  startValue: '',
  activeValue: 'active',
  inactiveValue: 'inactive',
})
</script>

<template>
  <div v-bind="$attrs" class="gs-marker-creator-button genshin-text transition-all">
    <button @click="collimatorVisible = !collimatorVisible">
      <el-icon color="currentColor" :size="24">
        <Plus />
      </el-icon>
      打点
    </button>
  </div>

  <Teleport v-if="mutuallyExclusiveLayerRef && collimatorEditMode" :to="mutuallyExclusiveLayerRef">
    <div
      class="center-marker-connection"
      :style="{
        '--w': `${width}px`,
        '--h': `${height}px`,
        '--deg': `${height / width}`,
      }"
    />
  </Teleport>

  <Teleport v-if="mutuallyExclusiveLayerRef && collimatorVisible" :to="mutuallyExclusiveLayerRef">
    <div class="gs-marker-creator-panel genshin-text">
      <div class="creator-collimator" :class="creatorPanelClassname" />

      <div class="creator-header" :class="creatorPanelClassname">
        <el-alert :closable="false" center style="width: 300px">
          <div class="text-base">
            {{ collimatorEditMode ? '编辑' : '创建' }}点位
          </div>
        </el-alert>
      </div>

      <div v-if="collimatorEditMode && cacheStartCoord" class="creator-collimator-info flex flex-col justify-end" :class="creatorPanelClassname">
        <div>原坐标</div>
        <div>X: {{ cacheStartCoord[0].toFixed(4) }}</div>
        <div>Y: {{ cacheStartCoord[1].toFixed(4) }}</div>
      </div>

      <div class="creator-collimator-info top-1/2" :class="creatorPanelClassname">
        <div>选择坐标</div>
        <div>X: {{ target[0].toFixed(4) }}</div>
        <div>Y: {{ target[1].toFixed(4) }}</div>
      </div>

      <div class="creator-action" :class="creatorPanelClassname">
        <GSButton class="pointer-events-auto" icon="submit" @click="confirm">
          确认
        </GSButton>
        <GSButton class="pointer-events-auto" icon="cancel" @click="cancel">
          取消
        </GSButton>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.gs-marker-creator-panel {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  color: #FFF;
  filter: drop-shadow(0 0 6px #00000080);
  pointer-events: none;
}

.creator-collimator {
  position: absolute;
  width: 100%;
  height: 100%;
  background:
    repeating-linear-gradient(90deg, transparent calc(50% - 0.5px), #FFF calc(50% - 0.5px), #FFF calc(50% + 0.5px), transparent calc(50% + 0.5px), transparent 100%),
    repeating-linear-gradient(transparent calc(50% - 0.5px), #FFF calc(50% - 0.5px), #FFF calc(50% + 0.5px), transparent calc(50% + 0.5px), transparent 100%),
    transparent;
  scale: 0;

  @keyframes collimator-anime-in {
    from { scale: 0; }
    to { scale: 1; }
  }
  @keyframes collimator-anime-out {
    from { scale: 1; }
    to { scale: 0; }
  }

  &.active {
    animation: collimator-anime-in 150ms ease forwards;
  }
  &.inactive {
    scale: 1;
    animation: collimator-anime-out 150ms ease forwards;
  }
}

.creator-header {
  position: absolute;
  width: 100%;
  padding: 16px;
  translate: 0% -100%;
  display: flex;
  justify-content: center;
  font-size: 32px;

  @keyframes header-anime-in {
    from { translate: 0% -100%; }
    to { translate: 0% 0%; }
  }
  @keyframes header-anime-out {
    from { translate: 0% 0%; }
    to { translate: 0% -100%; }
  }

  &.active {
    animation: header-anime-in 150ms ease forwards;
  }
  &.inactive {
    translate: 0% 0%;
    animation: header-anime-out 150ms ease forwards;
  }
}

.creator-collimator-info {
  position: absolute;
  width: 50%;
  height: 50%;
  left: 50%;
  padding: 16px;
  opacity: 0;
  transition: all ease 150ms;
  &.active {
    opacity: 1;
  }
  &.inactive {
    opacity: 0;
  }
}

.creator-action {
  position: absolute;
  width: 100%;
  bottom: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  translate: 0% 100%;

  @keyframes action-anime-in {
    from { translate: 0% 100%; }
    to { translate: 0% 0%; }
  }
  @keyframes action-anime-out {
    from { translate: 0% 0%; }
    to { translate: 0% 100%; }
  }

  &.active {
    animation: action-anime-in 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  &.inactive {
    translate: 0% 0%;
    animation: action-anime-out 150ms ease forwards;
  }
}

.gs-marker-creator-button {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 16px;
  z-index: 1;
  filter: drop-shadow(0 0 4px #333);

  button {
    pointer-events: all;
    outline: 2px solid #3B4255;
    border: 2px solid transparent;
    outline-offset: -4px;
    background-color: #ECE5D8CC;
    color: #3B4255;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    transition: all ease 150ms;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    line-height: 1;
    font-size: 14px;

    &:hover {
      border-color: #FFF;
      background-color: #ECE5D8;
    }
    &:active {
      background-color: #ECE5D880;
      filter: drop-shadow(0 0 4px gray);
    }
  }
}

// 点位与中心标记的连线
.center-marker-connection {
  --line-color: #FFF;
  --line-width: 1px;
  --x-end: calc(50% + var(--w));
  --y-end: calc(50% + var(--h));

  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(
    50% 50%,
    var(--x-end) 50%,
    var(--x-end) var(--y-end),
    50% var(--y-end),
  );
  background: linear-gradient(
    atan(var(--deg)),
    transparent calc(50% - var(--line-width) / 2 - 1px),
    var(--line-color) calc(50% - var(--line-width) / 2),
    var(--line-color) calc(50% + var(--line-width) / 2),
    transparent calc(50% + var(--line-width) / 2 + 1px),
  );
  z-index: 10;
}
</style>
