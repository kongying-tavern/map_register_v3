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
  /** icon 标题部分的 class */
  titleClass?: string
}>(), {
  icon: true,
})
</script>

<template>
  <div
    v-if="icon"
    class="radio-card-item__icon h-full aspect-square rounded-lg grid place-items-center transition-all duration-150"
    :class="{ actived }"
  >
    <el-image
      :src="src"
      :alt="title"
      :title="title"
      fit="contain"
      referrerpolicy="no-referrer"
      crossorigin=""
      class="w-4/5 h-4/5 bg-transparent"
      style="--el-fill-color-light: transparent"
    >
      <template #error>
        <img class="w-full h-full object-contain" crossorigin="" src="https://assets.yuanshen.site/icons/-1.png">
      </template>
    </el-image>
  </div>

  <div
    class="radio-card-item__title flex-1 px-2 align-middle whitespace-nowrap overflow-hidden text-ellipsis leading-7"
    :class="{
      actived,
      [titleClass ?? '']: titleClass,
    }"
  >
    {{ title }}
  </div>
</template>

<style lang="scss" scoped>
.radio-card-item__icon {
  background: rgba(0 0 0 / 0.8);

  &.actived {
    background: rgb(48 49 51 / 0.2);
  }
}
</style>
