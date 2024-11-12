<script setup lang="ts">
import LinkActionLabel from './LinkActionLabel.vue'
import type { LinkActionEnum } from '@/shared'
import { LINK_ACTION_OPTIONS } from '@/shared'

const modelValue = defineModel<LinkActionEnum>('modelValue', {
  required: true,
})
</script>

<template>
  <div class="w-full flex flex-col justify-center items-center">
    <ElSelectV2
      v-model="modelValue"
      :options="LINK_ACTION_OPTIONS"
      style="width: 120px"
    >
      <template #label>
        <LinkActionLabel :value="modelValue" />
      </template>

      <template #default="{ item }">
        <LinkActionLabel :value="item.value" />
      </template>
    </ElSelectV2>
  </div>
</template>
