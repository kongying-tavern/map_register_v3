<script lang="ts" setup>
const props = defineProps<{
  keepAlive?: boolean
}>()
const ctx = getCurrentInstance()
</script>

<template>
  <div class="flex flex-col p-4 overflow-hidden transition-all duration-200" v-bind="$attrs">
    <div v-if="ctx?.slots.header" class="layout-page__header">
      <slot name="header" />
    </div>

    <div class="flex-1 overflow-hidden">
      <router-view>
        <template #default="{ Component, route }">
          <transition name="scale" mode="out-in" appear>
            <keep-alive v-if="props.keepAlive">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
            <component :is="Component" v-else :key="route.fullPath" />
          </transition>
        </template>
      </router-view>
    </div>
  </div>
</template>
