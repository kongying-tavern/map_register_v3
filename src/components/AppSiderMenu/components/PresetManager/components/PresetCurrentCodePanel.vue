<script lang="ts" setup>
import { PresetCodePreview } from '.'
import { useCurrentPreset } from '../hooks'

const { conditions } = useCurrentPreset()
</script>

<template>
  <div class="flex flex-col h-full pt-1">
    <PresetCodePreview
      :conditions="conditions"
      title="当前分享码"
      tip="以下为当前筛选条件的分享码"
    />
  </div>
</template>
