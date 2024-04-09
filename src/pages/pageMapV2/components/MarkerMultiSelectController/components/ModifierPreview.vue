<script setup lang="ts">
import type { Modifier } from '../core'
import type { GSMapState } from '@/stores/types/genshin-map-state'

defineProps<{
  modifier: Modifier
  meta: API.TweakConfigMetaVo
  data: GSMapState.MarkerWithRenderConfig
}>()
</script>

<template>
  <Suspense>
    <component
      :is="modifier.previewer"
      :value="modifier.getValue(data)"
    />

    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
