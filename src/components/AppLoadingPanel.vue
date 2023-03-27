<script lang="ts" setup>
import { ElNotification } from 'element-plus'
import { localSettings, useUserStore } from '@/stores'

const userStore = useUserStore()

const icons = ['Pyro', 'Hydro', 'Anemo', 'Electro', 'Cryo', 'Dendro', 'Geo']

onActivated(() => {
  userStore.isRouteLoading = true
})

const onAnimationend = (ev: AnimationEvent) => {
  if (!(ev.target as HTMLElement).classList.contains('icon-Geo'))
    return
  userStore.isRouteLoading = false
  ElNotification.closeAll()
}
</script>

<template>
  <div class="gs-loading-panel w-full h-full grid place-items-center" :class="{ 'waitting-geo': localSettings.waittingGeo }">
    <div class="gs-loading-row w-full h-full flex flex-row justify-center">
      <div
        v-for="iconname in icons" :key="iconname"
        class="gs-loading-icon"
        :class="[`icon-${iconname}`]"
        @animationend="onAnimationend"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@property --percentage {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@keyframes bg-slide {
  from {
    --percentage: 0%;
  }
  to {
    --percentage: 100%;
  }
}

.gs-loading-row {
  gap: 2%;
}

.gs-loading-icon {
  aspect-ratio: 1 / 1;
  background: linear-gradient(to right, rgb(102 102 102) var(--percentage), rgb(245 245 245) var(--percentage));
  animation: bg-slide 50ms linear forwards;
  width: 60px;
  &:first-of-type {
    grid-column-start: 2;
  }
  @for $i from 1 through 7 {
    &:nth-of-type(#{$i}) {
      animation-delay: #{400 + $i * 100}ms;
    }
  }
}

.gs-loading-panel.waitting-geo {
  .gs-loading-icon:last-of-type {
    animation-duration: 1000ms;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
}

.icon {
  @each $name in Pyro, Hydro, Anemo, Electro, Cryo, Dendro, Geo {
    &-#{$name} {
      mask: url('/icons/#{$name}.svg');
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: 50% 50%;
    }
  }
}
</style>
