<script setup lang="ts">
import type { Modifier } from '../core'
import type { GSMapState } from '@/stores/types/genshin-map-state'

defineProps<{
  modifier: Modifier
  meta: API.TweakConfigMetaVo
  data: GSMapState.MarkerWithRenderConfig
  oldData?: GSMapState.MarkerWithRenderConfig
}>()
</script>

<template>
  <Suspense>
    <component
      :is="modifier.previewer"
      :value="modifier.getValue(data, !oldData, meta)"
      :old-value="oldData ? modifier.getValue(oldData, true, meta) : undefined"
      :options="modifier.options"
    />

    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
