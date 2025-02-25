<script lang="ts" setup>
import { useRouteStore } from '@/stores'
import { ElNotification } from 'element-plus'

const routeStore = useRouteStore()

const icons = ['Pyro', 'Hydro', 'Anemo', 'Electro', 'Cryo', 'Dendro', 'Geo']

const visible = ref(false)

whenever(() => routeStore.loading, () => {
  visible.value = true
})

whenever(() => !routeStore.loading, () => setTimeout(() => {
  visible.value = false
}, 1000))

const onAnimationend = (ev: AnimationEvent) => {
  if (!(ev.target as HTMLElement).classList.contains('icon-Geo'))
    return
  ElNotification.closeAll()
}
</script>

<template>
  <Transition name="fade">
    <div
      v-show="visible"
      class="gs-loading-panel waitting-geo"
    >
      <div
        v-for="iconname in icons" :key="iconname"
        class="gs-loading-icon"
        :class="[
          `icon-${iconname}`,
          {
            finished: !visible,
          },
        ]"
        @animationend="onAnimationend"
      />
    </div>
  </Transition>
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

  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  background: var(--el-bg-color);
  width: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2%;

  &.waitting-geo {
    --geo-duration: 60000ms;
  }
}

.gs-loading-icon {
  background: linear-gradient(to right, rgb(102 102 102) var(--percentage), rgb(245 245 245) var(--percentage));
  animation: bg-slide 50ms linear forwards;
  width: 60px;
  aspect-ratio: 1 / 1;
  max-width: 12.5%;
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
  &.finished {
    animation: none;
    --percentage: 100%;
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
