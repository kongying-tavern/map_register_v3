<script setup lang="ts">
import { useRouteStore } from '@/stores'

const routeStore = useRouteStore()

const error = ref('')

// 消费错误信息，以避免重复载入
onMounted(() => {
  error.value = routeStore.error
  routeStore.error = ''
})
</script>

<template>
  <div class="w-full h-full flex flex-col justify-center bg-[var(--el-color-primary)] text-[var(--el-color-white)] px-[10%]">
    <div class="text-9xl mb-8">
      {{ `:(` }}
    </div>

    <div class="text-4xl mb-8">
      因关键错误崩溃。
    </div>

    <div class="min-h-[4em] text-xl mb-8">
      {{ routeStore.error }}
    </div>

    <div>
      <div>请将错误反馈至开发团队。</div>
      <a
        href="https://github.com/kongying-tavern/map_register_v3/issues"
        target="_blank"
        rel="noreferrer"
        class="underline underline-offset-[6px]"
      >
        https://github.com/kongying-tavern/map_register_v3/issues
      </a>
    </div>
  </div>
</template>
