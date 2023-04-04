<script lang="ts" setup>
import { ElNotification } from 'element-plus'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const icons = ['Pyro', 'Hydro', 'Anemo', 'Electro', 'Cryo', 'Dendro', 'Geo']

onActivated(() => {
  userStore.isRouteAnimationEnd = false
})

const onAnimationend = (ev: AnimationEvent) => {
  if (!(ev.target as HTMLElement).classList.contains('icon-Geo'))
    return
  userStore.isRouteAnimationEnd = true
  ElNotification.closeAll()
}
</script>

<template>
  <div
    class="gs-loading-panel w-full h-full grid place-items-center"
    :class="{
      'waitting-geo': userStore.isHandling,
    }"
  >
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

@keyframes wait-geo {
  0% {
    --percentage: 0%;
  }
  0.025% {
    --percentage: 50%;
  }
  100% {
    --percentage: 100%;
  }
}

.gs-loading-panel {
  --icon-duration: 50ms;
  --geo-duration: var(--icon-duration);

  &.waitting-geo {
    --geo-duration: 60000ms;
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
  &:last-of-type {
    animation-duration: var(--geo-duration);
    animation-name: wait-geo;
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
