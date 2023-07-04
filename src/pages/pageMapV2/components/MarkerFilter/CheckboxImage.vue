<script lang="ts" setup>
import { PictureFilled, QuestionFilled } from '@element-plus/icons-vue'

defineProps<{
  src?: string
}>()

const isLoading = ref(false)
const isError = ref(false)

const end = (isErr = false) => {
  isLoading.value = false
  isError.value = isErr
}
</script>

<template>
  <div
    class="w-full aspect-square relative"
    :data-raw-src="decodeURIComponent(src ?? '')"
  >
    <QuestionFilled v-if="!src || isError" class="absolute w-full h-full left-0 top-0" />
    <PictureFilled v-if="isLoading" class="absolute w-full h-full left-0 top-0" />

    <img
      v-if="src"
      class="w-full aspect-square object-contain"
      :src="src.trim()"
      crossorigin=""
      loading="lazy"
      decoding="async"
      :style="{
        opacity: isError ? '0' : '100%',
      }"
      @loadstart="isLoading = true"
      @load="() => end()"
      @error="() => end(true)"
    >
  </div>
</template>
