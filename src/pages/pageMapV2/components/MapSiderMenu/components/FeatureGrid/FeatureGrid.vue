<script lang="ts" setup>
import type { FeatureOption } from '.'

defineProps<{
  features: FeatureOption[]
}>()
</script>

<template>
  <el-scrollbar height="100%">
    <div class="feature-grid genshin-text">
      <div v-for="feature in features" :key="feature.label" class="grid-unit" @click="() => feature.cb()">
        <div class="grid-unit-icon">
          <component :is="feature.icon" class="h-full" />
        </div>
        <div class="grid-unit-label">
          <span class="w-full inline-block whitespace-nowrap text-ellipsis overflow-hidden text-center">
            {{ feature.label }}
          </span>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.feature-grid {
  --gap: 8px;
  --transition: all ease-out 150ms;

  display: grid;
  width: 350px;
  height: 100%;
  place-content: start;
  gap: 8px;
  padding: 16px;
  grid-template-columns: repeat(3, 1fr);
}

@keyframes jump-loop {
  0% {
    translate: 0 0;
  }
  50% {
    translate: 0 4px;
  }
  100% {
    translate: 0 0;
  }
}

.grid-unit {
  --bg: #565F6F;
  --border-scale: 0.95;
  --outline-color: transparent;
  --border-color: #E4DDD140;
  --arrow-visible: hidden;

  padding: 2.5%;
  aspect-ratio: 1 / 1;
  display: grid;
  align-content: center;
  justify-items: center;
  grid-template-rows: repeat(6, 1fr);
  background: var(--bg);
  position: relative;
  scale: 1;
  color: #ECE5D8;
  outline: 2px solid var(--outline-color);
  cursor: pointer;
  user-select: none;
  transition: var(--transition);

  &:hover {
    scale: 1.1;
    --border-scale: 1.05;
    --outline-color: #F4E3C0;
    --arrow-visible: visible;
    filter: drop-shadow(0 0 4px rgb(80 80 80 / 0.6));
  }

  &:active {
    scale: 1.05;
    --border-scale: 0.95;
    --outline-color: transparent;
    --bg: #FEFEFD;
    --border-color: #565F6F40;
    --arrow-visible: hidden;
    color: #454F66;
    filter: drop-shadow(0 0 0 rgb(80 80 80 / 0.6));
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    scale: var(--border-scale);
    border: 1px solid var(--border-color);
    pointer-events: none;
    transition: var(--transition);
  }

  &::after {
    visibility: var(--arrow-visible);
    content: '';
    position: absolute;
    left: calc(50% - 5px);
    width: 12px;
    aspect-ratio: 1 / 1;
    background: conic-gradient(from -45deg, #FFF 90deg, transparent 90deg);
    animation: jump-loop 1s infinite;
    filter: drop-shadow(0 0 4px #FFF);
    pointer-events: none;
  }
}

.grid-unit-icon {
  width: 100%;
  grid-row-start: span 4;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.grid-unit-label {
  width: 100%;
  grid-row-start: span 2;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
</style>
