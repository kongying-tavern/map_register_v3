<script setup lang="ts">
import type { Modifier } from '../core'
import type { TweakConfigMetaVo } from '@/api/alova/globals'
import type { GSMarkerInfo } from '@/packages/map'

defineProps<{
  modifier: Modifier
  meta: TweakConfigMetaVo
  data: GSMarkerInfo
  oldData?: GSMarkerInfo
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
