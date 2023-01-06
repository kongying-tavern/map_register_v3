<script lang="ts" setup>
withDefaults(defineProps<{
  /** icon 图片地址 */
  src?: string
  /** 选项标题 */
  title?: string
  /** 选项是否为激活状态 */
  actived?: boolean
  /** 是否显示 icon 图标 */
  icon?: boolean
}>(), {
  icon: true,
})
</script>

<template>
  <div
    v-if="icon"
    class="h-full aspect-square rounded grid place-items-center transition-all duration-150"
    :class="{
      'bg-gray-800': !actived,
      'bg-slate-700': actived,
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

  <div class="flex-1 px-2 align-middle whitespace-nowrap overflow-hidden text-ellipsis leading-7">
    {{ title }}
  </div>
</template>
