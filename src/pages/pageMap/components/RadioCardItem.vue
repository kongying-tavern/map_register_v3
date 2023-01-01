<script lang="ts" setup>
defineProps<{
  src?: string
  title?: string
  actived?: boolean
  leaf?: boolean
}>()
</script>

<template>
  <div
    v-show="!leaf"
    class="h-full aspect-square rounded grid place-items-center bg-gray-800 transition-all duration-150"
    :class="{
      'bg-stone-500': actived,
    }"
  >
    <el-image
      :src="src"
      :alt="title"
      :title="title"
      fit="contain"
      referrerpolicy="no-referrer"
      class="w-4/5 h-4/5 bg-transparent"
      style="--el-fill-color-light: transparent"
    >
      <template #error>
        <img class="w-full h-full object-contain" src="https://assets.yuanshen.site/icons/-1.png">
      </template>
    </el-image>
  </div>

  <div class="flex-1 align-middle whitespace-nowrap overflow-hidden text-ellipsis leading-7">
    {{ title }}
  </div>
</template>
