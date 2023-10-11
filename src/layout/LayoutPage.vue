<template>
  <router-view>
    <template #default="{ Component, route }">
      <div
        v-bind="$attrs"
        class="h-full overflow-hidden transition-all duration-200"
        :class="{
          'p-4': !route.meta.noPadding,
        }"
      >
        <transition name="scale" mode="out-in" appear>
          <keep-alive>
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </div>
    </template>
  </router-view>
</template>
