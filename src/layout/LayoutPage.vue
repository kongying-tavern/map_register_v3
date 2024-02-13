<script setup lang="ts">
const router = useRouter()

const getRouteIndex = (routePath: string) => {
  return router.getRoutes().findIndex(({ path }) => path === routePath)
}

const transitionName = ref<'route-slide-up' | 'route-slide-down'>('route-slide-down')

/** 过渡滚动的距离 */
const distance = ref(30)

/**
 * 动态路由过渡，根据 index 判断路由顺序，从下向上导航时使用下滚动过渡，反之同理
 * @note 如果没有问题的话，route index 就是路由的渲染顺序
 */
onBeforeRouteUpdate((updateGuard, from, next) => {
  const startIndex = getRouteIndex(from.path)
  const endIndex = getRouteIndex(updateGuard.path)
  distance.value = 30 * Math.abs(startIndex - endIndex)
  transitionName.value = startIndex > endIndex ? 'route-slide-down' : 'route-slide-up'
  next(true)
})
</script>

<template>
  <router-view>
    <template #default="{ Component, route: currentRoute }">
      <div
        v-bind="$attrs"
        class="h-full overflow-hidden transition-all duration-200"
      >
        <transition :name="transitionName" mode="out-in" appear :style="{ '--range': distance }">
          <keep-alive>
            <component :is="Component" :key="currentRoute.fullPath" />
          </keep-alive>
        </transition>
      </div>
    </template>
  </router-view>
</template>

<style lang="scss">
.route-slide-down {
  &-enter-active, &-leave-active {
    transition: all 0.1s ease-out;
  }

  &-enter-from {
    opacity: 0;
    transform: translateY(calc((var(--range)) * -1px));
  }

  &-leave-to {
    opacity: 0;
    transform: translateY(calc(var(--range) * 1px));
  }
}

.route-slide-up {
  &-enter-active, &-leave-active {
    transition: all 0.1s ease-out;
  }

  &-enter-from {
    opacity: 0;
    transform: translateY(calc(var(--range) * 1px));
  }

  &-leave-to {
    opacity: 0;
    transform: translateY(calc(var(--range) * -1px));
  }
}
</style>
